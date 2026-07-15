<div class="about-hero">
	<canvas id="connectome" aria-hidden="true"></canvas>
	<div class="about-hero__inner">
		<img src="/images/2022.07.22 - Dehsarvi Amir - ISD 9278.JPG" alt="Dr. Amir Dehsarvi" class="about-hero__photo">
		<h1>Dr. Amir Dehsarvi</h1>
		<h2 class="about-hero__role">Principal Scientist, Neuroimaging</h2>
	</div>
</div>

<div class="about-intro">
	<p class="about-intro__lead">
		I am a Principal Scientist of Neuroimaging at <a href="https://www.boehringer-ingelheim.com">Boehringer Ingelheim</a>, where I apply machine learning and deep learning to medical imaging data to accelerate disease diagnosis and therapeutic target identification.
	</p>
	<p>
		I hold a PhD in Electronic Engineering from the University of York, and my path to industry ran through postdoctoral research at Trinity College Dublin, the University of Aberdeen, the University of York, and most recently the Institute for Stroke and Dementia Research (ISD) at LMU Munich. Alongside this, I served for seven years as Chief Technology Officer at ClearSky Medical Diagnostics, developing ML-based medical devices for neurodegenerative conditions.
	</p>
	<p>
		At LMU I built <b>ADPrep</b>, a fully automated multi-modal neuroimaging preprocessing pipeline (MRI, fMRI, PET, DTI) now underpinning more than 25 peer-reviewed publications and slated for integration into the <a href="https://www.grip-research.org/platform">GRIP platform</a>, a Gates Ventures initiative. I also developed a deep learning model that infers full Alzheimer's disease A/T/N classification from a single tau-PET scan, predicting amyloid-PET (r=0.8) and grey matter density (r=0.76).
	</p>
	<p class="about-intro__links">
		<a href="/about/">More about my background</a> &nbsp;·&nbsp; <a href="/publications/">Publications</a> &nbsp;·&nbsp; <a href="/cv/">CV</a>
	</p>
</div>

<style>
.about-hero {
	position: relative;
	margin: 1.5rem 0 2rem;
	padding: 2rem 1rem;
	min-height: 340px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border-radius: 12px;
}
#connectome {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}
.about-hero__inner {
	position: relative;
	text-align: center;
}
.about-hero__photo {
	width: 160px;
	border-radius: 50%;
	box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	margin-bottom: 1.5rem;
	background: #fff;
}
.about-hero h1 { margin-bottom: 0.25rem; }
.about-hero__role {
	font-weight: 400;
	color: #555;
	margin-top: 0;
}
.about-intro {
	max-width: 640px;
	margin: 0 auto;
	text-align: center;
}
.about-intro p { color: #444; }
.about-intro__lead { font-size: 1.15rem; color: #333; }
.about-intro__links { margin-top: 1.5rem; }
@media (max-width: 600px) {
	.about-hero { min-height: 240px; padding: 1.5rem 0.5rem; }
	.about-hero__photo { width: 120px; }
}
</style>

<script src="/assets/js/connectome-hero.js"></script>
