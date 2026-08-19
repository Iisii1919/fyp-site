'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import InformedConsent from '@/components/InformedConsent';
import ParticipantInfo from '@/components/ParticipantInfo';
import VideoViewer from '@/components/VideoViewer';
import Questionnaire from '@/components/Questionnaire';
import ThankYou from '@/components/ThankYou';

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  const [participantData, setParticipantData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
  });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [questionnaireData, setQuestionnaireData] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '',
    q6: '', q7: '', q8: '', q9: '', q10: '',
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= -100 && rect.top <= 100) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConsentAccepted = () => {
    setConsentAccepted(true);
  };

  const handleParticipantSubmit = (data: typeof participantData) => {
    setParticipantData(data);
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
  };

  const handleQuestionnaireSubmit = (data: {[key: string]: string}) => {
    setQuestionnaireData(data as typeof questionnaireData);
  };

  return (
    <main className="bg-[#08070a]">
      <section data-section="0" className="h-screen w-full overflow-hidden">
        <Hero />
      </section>

      <section data-section="1" className="h-screen w-full overflow-hidden">
        <InformedConsent onAccepted={handleConsentAccepted} />
      </section>

      <section data-section="2" className="h-screen w-full overflow-hidden">
        <ParticipantInfo 
          onSubmit={handleParticipantSubmit}
          consentAccepted={consentAccepted}
        />
      </section>

      <section data-section="3" className="w-full">
        <VideoViewer 
          onProgress={handleVideoProgress}
          progress={videoProgress}
        />
      </section>

      {/* 問卷吸附點 */}
      <div className="snap-point"></div>
      <section data-section="4" className="w-full no-snap">
        <Questionnaire onSubmit={handleQuestionnaireSubmit} participantData={participantData} />
      </section>

      <section data-section="5" className="h-screen w-full overflow-hidden">
        <ThankYou participantName={participantData.name} />
      </section>
    </main>
  );
}
