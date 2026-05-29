
permalink: /index.html
title: "Dr. Amir Dehsarvi"
excerpt: "Principal Scientist in Neuroimaging, AI & Data Science Innovator"
header:
    image: "2022.07.22 - Dehsarvi Amir - ISD 9278.JPG"
    overlay_color: "#222"
    overlay_filter: 0.3
    cta_label: "View My Work"
    cta_url: "/portfolio.html"
author_profile: true
redirect_from:
    - /about/
    - /about.html
---
{% include page__hero.html %}


<div class="section section--projects">
    <h2 class="section__title">Featured Projects</h2>
    <div class="grid__wrapper">
        {% assign featured = site.portfolio | slice: 0, 3 %}
        {% for post in featured %}
            <div class="grid__item">
                <a href="{{ post.url }}">
                    <div class="grid__item-image">
                        <img src="/images/500x300.png" alt="{{ post.title }}">
                    </div>
                    <div class="grid__item-title">{{ post.title }}</div>
                    <div class="grid__item-excerpt">{{ post.excerpt | markdownify }}</div>
                </a>
            </div>
        {% endfor %}
    </div>
</div>

<div class="section-divider"></div>

<div class="section section--experience">
    <h2 class="section__title">Professional Experience</h2>
    <div>
I am a Machine Learning Engineer & Neuroimaging Data Scientist with extensive expertise in advanced neuroimaging data analysis, AI-driven medical technologies, and high-performance computing. I lead initiatives in developing and optimizing sophisticated ML/DL models for complex healthcare applications, particularly leveraging cutting-edge neuroimaging techniques. My proficiency spans Python, MATLAB, R, and leading deep learning frameworks. I have a proven track record in building scalable data pipelines, automating intricate neuroimaging workflows, and seamlessly integrating AI solutions into real-world clinical and research applications. My passion lies in driving transformative innovation in health tech, especially within the neurosciences, through data science and machine learning.

<ul>
<li><b>2025 to date:</b> Principal Scientist Neuroimagine, Boehringer Ingelheim (Germany).</li>
<li><b>2018-2025:</b> Chief Technology Officer, <a href="https://www.clearskymd.com">ClearSky Medical Diagnostics Ltd.</a>, York (UK).
    <ul>
        <li>Contributed to the development of machine learning (ML)-based medical devices for diagnosing and monitoring neurodegenerative conditions, including PD-Monitor, LID-Monitor, and MCI-Monitor.</li>
        <li>Optimized ML for movement disorder analysis, enhancing diagnostic precision.</li>
        <li>Collaborated with multidisciplinary teams, including clinicians and engineers, to integrate AI-driven solutions into clinical applications.</li>
    </ul>
</li>
<li><b>2022-2025:</b> Postdoctoral Researcher, The Institute for Stroke and Dementia Research (ISD), Ludwig-Maximilians-Universität München (LMU), University of Munich (Germany).
    <ul>
        <li>Developed ADPREP, an automated neuroimaging preprocessing pipeline (using Python, MATLAB, R, Shell, etc.) for multiple modalities (MRI, fMRI, PET, DTI), optimizing data quality and analysis. This pipeline's effectiveness is demonstrated by its use in over 25 peer-reviewed publications (2023-present) in neurodegenerative disease research and it is going to be integrated into the <a href="https://www.grip-research.org/platform">GRIP platform</a>, a Gates Ventures initiative.</li>
        <li>Developed, validated, and deployed a deep learning model to infer full Alzheimer's disease A/T/N classification from single tau-PET scans, achieving high predictive accuracy for amyloid-PET (r=0.8) and MRI grey matter density (r=0.76).</li>
        <li>In addition to my research, I managed the High-Performance Computing (HPC) resources and provide support to research labs for their data analysis needs on the HPC and I was also an IT assistant for the LMU Hospital.</li>
    </ul>
</li>
<li><b>2021-2022:</b> Postdoctoral Research Associate, University of York (UK).
    <ul>
        <li>Applied white-box machine learning to resting-state fMRI data to differentiate depression from healthy controls.</li>
    </ul>
</li>
<li><b>2020-2021:</b> Research Fellow, University of Aberdeen (UK).
    <ul>
        <li>Used neuroimaging to define a fatigue-related brain network in rheumatoid arthritis, exploring how therapies impact it for potential DBS or similar targeting.</li>
    </ul>
</li>
<li><b>2021:</b> Machine Learning and Image Processing Engineer, <a href="https://smartr.ai">smartR.ai</a>, Edinburgh (UK).
    <ul>
        <li>Created deep learning pipelines to normalize and match color profiles between FIBI and H&E histological images.</li>
    </ul>
</li>
<li><b>2019:</b> Post-Doctoral Researcher in Neuroimaging, The University of Dublin (Ireland).
    <ul>
        <li>Linked speech patterns to brain volume changes in MCI/AD, exploring speech as an early marker of cognitive decline.</li>
    </ul>
</li>
<li><b>2016-2017:</b> Professional Engineer, My Therapy Tools Ltd.
    <ul>
        <li>Provided professional engineering support to a Horizon 2020 telerehabilitation platform development for brain injury patients.</li>
    </ul>
</li>
</ul>
    </div>
</div>

<div class="section-divider"></div>

<div class="section section--research">
    <h2 class="section__title">Research Focus</h2>
    <div>
My expertise lies in applying machine learning and deep learning to analyze complex biomedical data, particularly through the lens of neuroimaging. I lead initiatives to develop novel end-to-end analytical pipelines by integrating data such as brain imaging, movement, and speech, with a specific focus on diseases like Alzheimer's, Parkinson's, autism, and depression.
    </div>
</div>

<div class="section-divider"></div>

<div class="section section--collaborations">
    <h2 class="section__title">Collaborations</h2>
    <div>
I have had the pleasure and honour to work with renowned researchers such as [Dr.] Franzmeier](https://www.isd-research.de/franzmeier-lab), [Professor Smith](https://www.york.ac.uk/physics-engineering-technology/people/stephen_smith/), <a href="https://www.abdn.ac.uk/ims/people/profiles/g.waiter">Dr.</a> Waiter, <a href="https://www.gla.ac.uk/researchinstitutes/iii/staff/neilbasu/">Professor Basu</a>, and <a href="https://reillylab.net/richard-reilly">Professor Reilly</a> on multiple projects. These collaborations have focused on developing advanced automated neuroimaging preprocessing pipelines, objective assessment of depression from rsfMRI brain scans, investigating the underlying mechanisms of rheumatoid arthritis-related fatigue in the brain, and contributing to projects analyzing speech and brain imaging features for the classification of Alzheimer’s disease patients and mild cognitive impairment.
    </div>
</div>

<div class="section-divider"></div>

<div class="section section--education">
    <h2 class="section__title">Education</h2>
    <div>
<ul>
<li><b>2014-2018:</b> PhD Electronic Engineering, University of York (UK).
    <ul>
        <li>Supervision: <a href="https://www.york.ac.uk/physics-engineering-technology/people/stephen_smith/">Professor Smith</a>.</li>
        <li>Thesis: Cartesian Genetic Programming Classification of Resting-State fMRI: Towards a Brain Imaging Biomarker for Parkinson's Disease.</li>
    </ul>
</li>
<li><b>2013:</b> MSc Digital Signal Processing, University of York (UK).</li>
<li><b>2010:</b> BSc Applied Science Electronics, University of Science and Arts of Yazd (Iran).</li>
</ul>
    </div>
</div>

<div class="section-divider"></div>

<div class="section section--skills">
    <h2 class="section__title">Technical Skills</h2>
    <div>
Neuroimaging data analysis, Machine Learning, Deep Learning, Git, High Performance Computing, MATLAB, C, R, Python, Shell, PHP, SQL, Docker, Linux, AI-based medical devices.
    </div>
</div>

<style>
.section {
    background: #f9f9fb;
    border-radius: 12px;
    padding: 2rem 2rem 1.5rem 2rem;
    margin-bottom: 2.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.section__title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #2a2a2a;
    letter-spacing: 0.01em;
    border-left: 4px solid #4f8cff;
    padding-left: 0.75rem;
}
.section-divider {
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #4f8cff 0%, #fff 100%);
    margin: 2.5rem 0 2rem 0;
    border-radius: 2px;
    opacity: 0.25;
}
.grid__wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin: 2rem 0;
}
.grid__item {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    flex: 1 1 300px;
    max-width: 320px;
    text-align: center;
    transition: box-shadow 0.2s;
}
.grid__item:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.grid__item-image img {
    width: 100%;
    border-radius: 8px 8px 0 0;
}
.grid__item-title {
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    font-size: 1.1rem;
}
.grid__item-excerpt {
    color: #555;
    font-size: 0.95rem;
    margin-bottom: 1rem;
}
/* Hero CTA button animation */
.page__hero .btn,
.page__hero .cta {
    background: #4f8cff;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(79,140,255,0.10);
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}
.page__hero .btn:hover,
.page__hero .cta:hover {
    background: #2563eb;
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 6px 24px rgba(79,140,255,0.18);
}
</style>

I am a Machine Learning Engineer & Neuroimaging Data Scientist with extensive expertise in advanced neuroimaging data analysis, AI-driven medical technologies, and high-performance computing. I lead initiatives in developing and optimizing sophisticated ML/DL models for complex healthcare applications, particularly leveraging cutting-edge neuroimaging techniques. My proficiency spans Python, MATLAB, R, and leading deep learning frameworks. I have a proven track record in building scalable data pipelines, automating intricate neuroimaging workflows, and seamlessly integrating AI solutions into real-world clinical and research applications. My passion lies in driving transformative innovation in health tech, especially within the neurosciences, through data science and machine learning.

## Professional Experience

* **2025 to date:** Principal Scientist Neuroimagine, Boehringer Ingelheim (Germany).
* **2018-2025:** Chief Technology Officer, [ClearSky Medical Diagnostics Ltd.](https://www.clearskymd.com), York (UK).
    * Contributed to the development of machine learning (ML)-based medical devices for diagnosing and monitoring neurodegenerative conditions, including PD-Monitor, LID-Monitor, and MCI-Monitor.
    * Optimized ML for movement disorder analysis, enhancing diagnostic precision.
    * Collaborated with multidisciplinary teams, including clinicians and engineers, to integrate AI-driven solutions into clinical applications.
* **2022-2025:** Postdoctoral Researcher, The Institute for Stroke and Dementia Research (ISD), Ludwig-Maximilians-Universität München (LMU), University of Munich (Germany).
    * Developed ADPREP, an automated neuroimaging preprocessing pipeline (using Python, MATLAB, R, Shell, etc.) for multiple modalities (MRI, fMRI, PET, DTI), optimizing data quality and analysis. This pipeline's effectiveness is demonstrated by its use in over 25 peer-reviewed publications (2023-present) in neurodegenerative disease research and it is going to be integrated into the [GRIP platform](https://www.grip-research.org/platform), a Gates Ventures initiative.
    * Developed, validated, and deployed a deep learning model to infer full Alzheimer's disease A/T/N classification from single tau-PET scans, achieving high predictive accuracy for amyloid-PET (r=0.8) and MRI grey matter density (r=0.76).
    * In addition to my research, I managed the High-Performance Computing (HPC) resources and provide support to research labs for their data analysis needs on the HPC and I was also an IT assistant for the LMU Hospital.
* **2021-2022:** Postdoctoral Research Associate, University of York (UK).
    * Applied white-box machine learning to resting-state fMRI data to differentiate depression from healthy controls.
* **2020-2021:** Research Fellow, University of Aberdeen (UK).
    * Used neuroimaging to define a fatigue-related brain network in rheumatoid arthritis, exploring how therapies impact it for potential DBS or similar targeting.
* **2021:** Machine Learning and Image Processing Engineer, [smartR.ai](https://smartr.ai), Edinburgh (UK).
    * Created deep learning pipelines to normalize and match color profiles between FIBI and H&E histological images.
* **2019:** Post-Doctoral Researcher in Neuroimaging, The University of Dublin (Ireland).
    * Linked speech patterns to brain volume changes in MCI/AD, exploring speech as an early marker of cognitive decline.
* **2016-2017:** Professional Engineer, My Therapy Tools Ltd.
    * Provided professional engineering support to a Horizon 2020 telerehabilitation platform development for brain injury patients.

## Research Focus

My expertise lies in applying machine learning and deep learning to analyze complex biomedical data, particularly through the lens of neuroimaging. I lead initiatives to develop novel end-to-end analytical pipelines by integrating data such as brain imaging, movement, and speech, with a specific focus on diseases like Alzheimer's, Parkinson's, autism, and depression.

## Collaborations

I have had the pleasure and honour to work with renowned researchers such as [Dr. Franzmeier](https://www.isd-research.de/franzmeier-lab), [Prof. Smith](https://www.york.ac.uk/physics-engineering-technology/people/stephen_smith/), <a href="https://www.abdn.ac.uk/ims/people/profiles/g.waiter">Dr. Waiter</a>, <a href="https://www.gla.ac.uk/researchinstitutes/iii/staff/neilbasu/">Prof. Basu</a>, and <a href="https://reillylab.net/richard-reilly">Prof. Reilly</a> on multiple projects. These collaborations have focused on developing advanced automated neuroimaging preprocessing pipelines, objective assessment of depression from rsfMRI brain scans, investigating the underlying mechanisms of rheumatoid arthritis-related fatigue in the brain, and contributing to projects analyzing speech and brain imaging features for the classification of Alzheimer’s disease patients and mild cognitive impairment.

## Education

* **2014-2018:** PhD Electronic Engineering, University of York (UK).
    * Supervision: [Prof. Smith](https://www.york.ac.uk/physics-engineering-technology/people/stephen_smith/).
    * Thesis: Cartesian Genetic Programming Classification of Resting-State fMRI: Towards a Brain Imaging Biomarker for Parkinson's Disease.
* **2013:** MSc Digital Signal Processing, University of York (UK).
* **2010:** BSc Applied Science Electronics, University of Science and Arts of Yazd (Iran).

## Technical Skills

Neuroimaging data analysis, Machine Learning, Deep Learning, Git, High Performance Computing, MATLAB, C, R, Python, Shell, PHP, SQL, Docker, Linux, AI-based medical devices.
