import ResponsiveContainer from '~/components/ResponsiveContainer';
import PageHeader from '~/components/ui/typography/PageHeader';
import Paragraph from '~/components/ui/typography/Paragraph';
import ResetButton from '../_components/ResetButton';
import AnalyticsButton from '../_components/AnalyticsButton';
import RecruitmentTestSection from '../_components/RecruitmentTestSection';
import SettingsSection from '~/components/layout/SettingsSection';
import AnonymousRecruitmentSwitch from '~/components/ServerAnonymousRecruitmentSwitch/AnonymousRecruitmentSwitch';
import LimitInterviewsSwitch from '~/components/LimitInterviewsSwitch/LimitInterviewsSwitch';

export default function Settings() {
  return (
    <>
      <ResponsiveContainer>
        <PageHeader
          headerText="Settings"
          subHeaderText="Here you can configure your installation of Fresco."
        />
      </ResponsiveContainer>
      <ResponsiveContainer className="gap-4">
        <SettingsSection
          heading="Anonymous Recruitment"
          controlArea={<AnonymousRecruitmentSwitch />}
        >
          <Paragraph margin="none">
            If anonymous recruitment is enabled, you may generate an anonymous
            participation URL. This URL can be shared with participants to allow
            them to self-enroll in your study.
          </Paragraph>
        </SettingsSection>
        <SettingsSection
          heading="Limit Interviews"
          controlArea={<LimitInterviewsSwitch />}
        >
          <Paragraph margin="none">
            If this option is enabled, each participant will only be able to
            submit a single <strong>completed</strong> interview for each
            protocol (although they may have multiple incomplete interviews). 
            Once an interview has been completed, attempting to start a new 
            interview or to resume any other in-progress interview, will be
            prevented.
          </Paragraph>
        </SettingsSection>
        <SettingsSection heading="Reset Settings" controlArea={<ResetButton />}>
          <Paragraph margin="none">
            Delete all data and reset Fresco to its default state.
          </Paragraph>
        </SettingsSection>
        <SettingsSection
          heading="Send Test Analytics Event"
          controlArea={<AnalyticsButton />}
        >
          <Paragraph margin="none">
            This will send a test analytics event to the Fresco analytics
            server.
          </Paragraph>
        </SettingsSection>
        <RecruitmentTestSection />
      </ResponsiveContainer>
    </>
  );
}
