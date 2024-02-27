import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { inferAsyncReturnType } from '@trpc/server';
import { LuciaError } from 'lucia';
import * as context from 'next/headers';
import { auth } from '~/utils/auth';
import type { createTRPCContext } from '../context';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { prisma } from '~/utils/db';
import {
  userCreateFormSchema,
  userSignInFormSchema,
} from '~/app/(setup)/_components/schemas';
import { revalidatePath, revalidateTag } from 'next/cache';

type Context = inferAsyncReturnType<typeof createTRPCContext>;

export const signOutProc = async ({ ctx }: { ctx: Context }) => {
  const { session } = ctx;

  if (!session) {
    return {
      success: false,
    };
  }

  const authRequest = auth.handleRequest('POST', context);
  await auth.invalidateSession(session.sessionId);
  authRequest.setSession(null);

  revalidateTag('session.get');
  revalidatePath('/');

  return {
    success: true,
  };
};

export const sessionRouter = router({
  signUp: publicProcedure
    .input(userCreateFormSchema)
    .mutation(async ({ input }) => {
      const { username, password } = input;

      // Prevent signup if a user already exists
      // eslint-disable-next-line local-rules/require-data-mapper
      const usersExist = await prisma.user.findMany({
        where: {
          username,
        },
      });

      if (usersExist.length > 0) {
        return {
          error: 'User already configured.',
          user: null,
        };
      }

      try {
        const user = await auth.createUser({
          key: {
            providerId: 'username', // auth method
            providerUserId: username, // unique id when using "username" auth method
            password, // hashed by Lucia
          },
          attributes: {
            username,
          },
        });

        const session = await auth.createSession({
          userId: user.userId,
          attributes: {},
        });

        const authRequest = auth.handleRequest('POST', context);

        authRequest.setSession(session);

        return {
          error: null,
          user,
        };
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
          return {
            error: 'Username already exists.',
            user: null,
          };
        }

        throw e;
      }
    }),
  signIn: publicProcedure
    .input(userSignInFormSchema)
    .mutation(async ({ input }) => {
      const { username, password } = input;

      try {
        const key = await auth.useKey('username', username, password);

        const session = await auth.createSession({
          userId: key.userId,
          attributes: {},
        });

        const authRequest = auth.handleRequest('POST', context);

        authRequest.setSession(session);

        return {
          error: null,
          session,
        };
      } catch (e) {
        if (
          e instanceof LuciaError &&
          (e.message === 'AUTH_INVALID_KEY_ID' ||
            e.message === 'AUTH_INVALID_PASSWORD')
        ) {
          // user does not exist or invalid password
          return {
            session: null,
            error: 'Incorrect username or password',
          };
        }

        // eslint-disable-next-line no-console
        console.log('Unknown error', e);

        return {
          session: null,
          error: 'An unknown error occurred',
        };
      }
    }),
  signOut: protectedProcedure.mutation(signOutProc),
  get: publicProcedure.query(({ ctx }) => ctx.session ?? null),
});
