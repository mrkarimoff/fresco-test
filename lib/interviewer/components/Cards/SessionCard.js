import React from 'react';
import PropTypes from 'prop-types';
import { SessionCard as UISessionCard } from '~/lib/ui/components/Cards';
import { useSelector, useDispatch } from 'react-redux';
import { actionCreators as sessionActions } from '../../ducks/modules/activeSessionId';
import formatDatestamp from '../../utils/formatDatestamp';

const oneBasedIndex = (i) => parseInt(i || 0, 10) + 1;

const SessionCard = ({ sessionUUID }) => {
  const sessions = useSelector((state) => state.sessions);
  const session = sessions[sessionUUID];
  const installedProtocols = useSelector((state) => state.installedProtocols);
  const dispatch = useDispatch();
  const setSession = (sessionUID) =>
    dispatch(sessionActions.setSession(sessionUID));

  if (!session) {
    return null;
  }

  const {
    caseId,
    startedAt,
    updatedAt,
    exportedAt,
    finishedAt,
    protocolUID,
    currentStep,
  } = session;

  const protocol = installedProtocols[protocolUID];

  const { name, stages } = protocol;

  const progress = Math.round(
    (oneBasedIndex(currentStep) / oneBasedIndex(stages.length)) * 100,
  );

  const onClickLoadSession = (event) => {
    event.preventDefault();
    setSession(sessionUUID);
  };

  return (
    <UISessionCard
      caseId={caseId}
      startedAt={formatDatestamp(startedAt)}
      updatedAt={formatDatestamp(updatedAt)}
      exportedAt={formatDatestamp(exportedAt)}
      finishedAt={formatDatestamp(finishedAt)}
      protocolName={name}
      progress={progress}
      onClickHandler={onClickLoadSession}
    />
  );
};

SessionCard.propTypes = {
  sessionUUID: PropTypes.string.isRequired,
};

export default SessionCard;
