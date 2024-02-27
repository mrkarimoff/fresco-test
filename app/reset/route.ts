import { revalidatePath, revalidateTag } from 'next/cache';
import { getBaseUrl } from '~/trpc/shared';

/**
 *
 * This is an emergency bailout for if the server ends up with stale
 * data (such as appSettings, or session) that cannot be cleared by the user.
 *
 * For example, if a database is wiped outside of the app, app settings won't
 * be refetched automatically because they are addressively cached. This can
 * cause issues such as being redirected to the login screen, even though the
 * app is unconfigured and there are no users.
 *
 * Visiting this route handler should clear all caches and redirect the user
 * to the root of the app.
 */
export function GET() {
  revalidatePath('/');
  revalidateTag('appSettings.get');
  revalidateTag('appSettings.getAnonymousRecruitmentStatus');
  revalidateTag('interview.get.all');
  revalidateTag('participant.get.all');
  revalidateTag('dashboard.getActivities');

  return Response.redirect(getBaseUrl());
}
