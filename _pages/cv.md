---
layout: page
permalink: /cv/
title: CV
description: Education, honors, talks and service.
nav: true
nav_order: 3

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
  - role: Journal Reviewer
    label: Journal
    venues:
      - IEEE Transactions on Intelligent Transportation Systems (T-ITS)
  - role: Conference Reviewer
    label: Conference
    venues:
      - Transportation Research Board (TRB) Annual Meeting

awards:
  - year: Dec 2025
    title: "Outstanding Master's Thesis (Top 5%)"
    institution: Tongji University
    detail: "Study of the curve passing performance of the Virtual Track Train based on driving simulation platform"
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

<div class="about-me cv-page">
  <p class="cv-download">
    <a class="cv-download__link" href="{{ site.cv_pdf | prepend: 'assets/pdf/' | relative_url }}" target="_blank" rel="noopener noreferrer"
      ><i class="fa-solid fa-download" aria-hidden="true"></i>Download CV (PDF)</a
    >
  </p>

  <section class="cv-block">
    <h2 class="cv-block__title">Education</h2>
    {% for edu in page.education %}
      <div class="cv-row">
        <div class="cv-row__date">{{ edu.period }}</div>
        <div class="cv-row__body">
          <div class="cv-row__title">{{ edu.degree }}</div>
          <div class="cv-row__sub">
            {% if edu.logo %}<img src="{{ edu.logo | prepend: 'assets/img/' | relative_url }}" class="inline-logo" alt=""> {% endif %}{{ edu.institution }}{% if edu.college %}, {% if edu.college_url %}<a href="{{ edu.college_url }}">{{ edu.college }}</a>{% else %}{{ edu.college }}{% endif %}{% endif %}
          </div>
          {% if edu.advisor %}
            <div class="cv-row__note">
              Advisor: {% if edu.advisor_url %}<a href="{{ edu.advisor_url }}">{{ edu.advisor }}</a>{% else %}{{ edu.advisor }}{% endif %}
            </div>
          {% endif %}
        </div>
      </div>
    {% endfor %}
  </section>

  <section class="cv-block">
    <h2 class="cv-block__title">Honors and awards</h2>
    {% for a in page.awards %}
      <div class="cv-row">
        <div class="cv-row__date">{{ a.year }}</div>
        <div class="cv-row__body">
          <div class="cv-row__title">
            {{ a.title }}{% if a.institution %}<span class="cv-row__org">, {{ a.institution }}</span>{% endif %}
          </div>
          {% if a.detail %}
            <div class="cv-row__note">“{{ a.detail }}”</div>
          {% endif %}
        </div>
      </div>
    {% endfor %}
  </section>

  <section class="cv-block">
    <h2 class="cv-block__title">Talks</h2>
    {% for t in page.talks %}
      <div class="cv-row">
        <div class="cv-row__date">{{ t.year }}</div>
        <div class="cv-row__body">
          <div class="cv-row__title">{{ t.title }}</div>
          <div class="cv-row__note">{{ t.venue }}</div>
        </div>
      </div>
    {% endfor %}
  </section>

  <section class="cv-block">
    <h2 class="cv-block__title">Service</h2>
    {% for item in page.service %}
      <div class="cv-row">
        <div class="cv-row__date" aria-hidden="true">{{ item.label | default: item.role }}</div>
        <div class="cv-row__body">
          <div class="cv-row__sub"><span class="sr-only">{{ item.role }}: </span>{{ item.venues | join: '; ' }}</div>
        </div>
      </div>
    {% endfor %}
  </section>
</div>
