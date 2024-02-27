import { NextResponse, type NextRequest } from 'next/server';
import { trackEvent } from '~/analytics/utils';
import { api } from '~/trpc/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const handler = async (
  req: NextRequest,
  { params }: { params: { protocolId: string } },
) => {
  const protocolId = params.protocolId; // From route segment

  // If no protocol ID is provided, redirect to the error page.
  if (!protocolId || protocolId === 'undefined') {
    return NextResponse.redirect(new URL('/onboard/error', req.nextUrl));
  }

  const appSettings = await api.appSettings.get.query();

  // if limitInterviews is enabled
  // Check cookies for interview already completed for this user for this protocol
  // and redirect to finished page
  if (appSettings?.limitInterviews && cookies().get(protocolId)) {
    redirect('/interview/finished');
  }

  let participantIdentifier: string | undefined;

  // If the request is a POST, check the request body for a participant identifier.
  // Otherwise, check the searchParams for a participant identifier.
  if (req.method === 'POST') {
    const postData = (await req.json()) as
      | { participantIdentifier?: string }
      | undefined;
    participantIdentifier = postData?.participantIdentifier;
  } else {
    const searchParams = req.nextUrl.searchParams;
    participantIdentifier =
      searchParams.get('participantIdentifier') ?? undefined;
  }

  // Create a new interview given the protocolId and participantId
  const { createdInterviewId, error } = await api.interview.create.mutate({
    participantIdentifier,
    protocolId,
  });

  if (error) {
    void trackEvent({
      type: 'Error',
      name: error,
      message: 'Failed to create interview',
      metadata: {
        path: '/onboard/[protocolId]/route.ts',
      },
    });

    return NextResponse.redirect(new URL('/onboard/error', req.nextUrl));
  }

  // eslint-disable-next-line no-console
  console.log(
    `🚀 Created interview with ID ${createdInterviewId} using protocol ${protocolId} for participant ${
      participantIdentifier ?? 'Anonymous'
    }...`,
  );

  void trackEvent({
    type: 'InterviewStarted',
    metadata: {
      usingAnonymousParticipant: !participantIdentifier,
    },
  });

  // Redirect to the interview
  return NextResponse.redirect(
    new URL(`/interview/${createdInterviewId}`, req.nextUrl),
  );
};

export { handler as GET, handler as POST };
