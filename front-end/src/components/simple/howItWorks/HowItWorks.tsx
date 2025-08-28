import styles from './HowItWorks.module.scss';

export const HowItWorks = () => {
  const steps = [
    {
      headline: 'Files → Organized Data',
      text: 'Upload your files and we\'ll do the rest. Data is grouped by source and unpacked into clean, ' +
        'time-based series (like speed, location, or heart rate). Everything lines up so it\'s easy to compare.',
      image: '/api/placeholder/400/300', // Placeholder for raw files turning into time-series boxes
      alt: 'Raw files transforming into organized time-series data'
    },
    {
      headline: 'Presets → Instant Dashboards', 
      text: 'Presets scan your data, pick out what matters, and create dashboards automatically. ' +
        'Charts, maps, and summaries appear instantly—no setup required.',
      image: '/api/placeholder/400/300', // Placeholder for preset dashboard mockup
      alt: 'Preset dashboard with auto-filled charts and maps'
    },
    {
      headline: 'Analyzers → Smarter Insights',
      text: 'Fine-tune any data series with a click. Smooth noise, compress large files, or rescale values—' +
        'applied automatically or manually with the Σ (Sigma) button.',
      image: '/api/placeholder/400/300', // Placeholder for analyzer UI mockup
      alt: 'UI showing Sigma button with analyzer options'
    }
  ];

  return (
    <div className={styles.howItWorksWrapper}>
      <h2 className={styles.title}>How It Works</h2>
      
      <div className={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={index} className={`${styles.step} ${index % 2 === 1 ? styles.stepReverse : ''}`}>
            <div className={styles.stepContent}>
              <h3 className={styles.stepHeadline}>{step.headline}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
            <div className={styles.stepImage}>
              <img src={step.image} alt={step.alt} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <p className={styles.summaryText}>
          In short: Files become structured data → Presets build dashboards → Analyzers refine your view.
        </p>
        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>Files</div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>Presets</div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>Analyzers</div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>Insights</div>
        </div>
      </div>
    </div>
  );
};
