---
layout: page
permalink: /about-me/
title: About me
gradient_title: true
description: <i>A few things beyond the papers.</i>
nav: true
nav_order: 5

education:
  - degree: Ph.D. in Civil and Environmental Engineering
    college: Department of Civil and Environmental Engineering
    college_url: https://engineering.wisc.edu/departments/civil-environmental-engineering/
    institution: University of Wisconsin–Madison
    period: Sept 2025 – Present
    advisor: Dr. Sikai (Sky) Chen
    advisor_url: https://sky-lab-uw.github.io/people/
    logo: uwmadison.png
  - degree: M.S. in Transportation Engineering
    college: College of Transportation
    college_url: https://tjjt.tongji.edu.cn/
    institution: Tongji University
    period: Sept 2022 – Jun 2025
    advisor: Prof. Hechao Zhou
    advisor_url: https://tjjt.tongji.edu.cn/info/2943/10933.htm
    logo: tongji.png
  - degree: B.E. in Vehicle Engineering
    college: Institute of Rail Transit
    college_url: https://railway.tongji.edu.cn/main.htm
    institution: Tongji University
    period: Sept 2018 – Jun 2022
    advisor: Prof. Jimin Zhang
    advisor_url: https://railway.tongji.edu.cn/c5/e6/c4609a50662/page.htm
    logo: tongji.png

service:
  - Reviewer, Transportation Research Board (TRB) Annual Meeting

awards:
  - year: Oct 2024
    title: CRRC Zhuzhou Fellowship
    institution: Tongji University
  - year: Dec 2023
    title: First Prize in Harting Technology Competition
    institution: Harting Technology Group
  - year: Oct 2022
    title: Outstanding Student Scholarship
    institution: Tongji University

talks:
  - title: "Sky-Drive: A Distributed Multi-Agent Simulation Platform for Socially-Aware and Human-AI Collaborative Future Transportation"
    venue: 2025 Safe Mobility Conference (Poster), Madison, WI
    year: Apr 2025
---

<div class="about-me">
  <!-- intro -->

  <h4>Education</h4>

  <div class="entry-list">
    {% for edu in page.education %}
      <div class="entry">
        <div class="entry__title">{{ edu.degree }}</div>
        <div class="entry__sub">
          {% if edu.logo %}
            <img src="{{ edu.logo | prepend: 'assets/img/' | relative_url }}" class="inline-logo" alt="{{ edu.institution }}">
          {% endif %}
          {% if edu.college %}{% if edu.college_url %}<a href="{{ edu.college_url }}">{{ edu.college }}</a>{% else %}{{ edu.college }}{% endif %}, {% endif %}{{ edu.institution }}
        </div>
        <div class="entry__meta">
          {{ edu.period }}{% if edu.advisor %} · Advisor: {% if edu.advisor_url %}<a href="{{ edu.advisor_url }}">{{ edu.advisor }}</a>{% else %}{{ edu.advisor }}{% endif %}{% endif %}
        </div>
      </div>
    {% endfor %}
  </div>

  <h4>Honors & Awards</h4>

  <div class="entry-list">
    {% for a in page.awards %}
      <div class="entry">
        <div class="entry__title">{{ a.title }}</div>
        <div class="entry__meta">{{ a.institution }} · {{ a.year }}</div>
      </div>
    {% endfor %}
  </div>

  <h4>Talks</h4>

  <div class="entry-list">
    {% for t in page.talks %}
      <div class="entry">
        <div class="entry__title">{{ t.title }}</div>
        <div class="entry__meta">{{ t.venue }} · {{ t.year }}</div>
      </div>
    {% endfor %}
  </div>

  <h4>Service</h4>

  <div class="entry-list">
    {% for item in page.service %}
      <div class="entry">
        <div class="entry__title">{{ item }}</div>
      </div>
    {% endfor %}
  </div>

  <!-- =====================================================================
       Uncomment this block and replace the placeholder text/photos to publish it.

  <h4>Hobbies</h4>

  <p>Placeholder — one or two sentences about your hobbies.</p>

  <div class="row photo-row">
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/1.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/2.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/3.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
  </div>
  <p class="photo-caption">Placeholder caption — replace or delete this line.</p>

  <h4>Travel</h4>

  <ul class="memories-list">
    <li>Placeholder trip or city <span class="memory-date">(2025.09–2025.12)</span></li>
    <li>Placeholder trip or city <span class="memory-date">(2024.06)</span></li>
    <li>Placeholder trip or city</li>
  </ul>

  <div class="row photo-row">
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/4.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/5.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/6.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
  </div>
  <p class="photo-caption">Placeholder caption — replace or delete this line.</p>

  ===================================================================== -->
</div>
