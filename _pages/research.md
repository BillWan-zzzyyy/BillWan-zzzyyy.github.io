---
layout: page
permalink: /research/
title: Research
description: Autonomous driving and human-centered intelligent transportation, from simulation to real vehicles.
nav: true
nav_order: 1
---

<div class="research-page">

  <section class="research-section" id="sim-to-real" aria-labelledby="sim-to-real-title">
    <h2 id="sim-to-real-title">Sim-to-real driving</h2>
    <p>
      I study how driving policies trained in simulation can be deployed on real vehicles. Sim2Real-AD transfers CARLA-trained, VLM-guided reinforcement-learning policies to a full-scale vehicle without any real-world RL training data. It supports zero-shot deployment despite mismatches between simulator and vehicle observations and actions.
    </p>
    {% include figure.liquid path="assets/img/research/sim2real.jpg" class="img-fluid rounded" alt="Sim2Real-AD real-vehicle platform: lab-developed Ford E-Transit autonomous van with lidars, cameras, radar and the camera configuration" zoomable=true %}
    <h3 class="research-related-title">Papers</h3>
    <ul class="research-related">
      <li><a href="https://arxiv.org/abs/2604.03497">Sim2Real-AD: A Modular Sim-to-Real Framework for Deploying VLM-Guided Reinforcement Learning in Real-World Autonomous Driving</a> <span class="research-related__year">2026</span></li>
    </ul>
  </section>

  <section class="research-section" id="vlm-world-models" aria-labelledby="vlm-world-models-title">
    <h2 id="vlm-world-models-title">VLMs and world models</h2>
    <p>
      I use vision-language models to give driving agents semantic safety knowledge, and I study how well driving models handle rare, dangerous situations. DriveVLM-RL learns semantic rewards from VLMs during training and removes them at deployment. Other work examines world models trained on mostly safe futures, and diagnoses end-to-end and VLA driving policies under domain shift.
    </p>
    {% include figure.liquid path="assets/img/research/vlm-driving.png" class="img-fluid rounded" alt="DriveVLM-RL: VLM-as-control and VLM-as-reward paradigms and the dual-pathway DriveVLM-RL framework" zoomable=true %}
    <h3 class="research-related-title">Papers</h3>
    <ul class="research-related">
      <li><a href="https://arxiv.org/abs/2603.18315">DriveVLM-RL: Neuroscience-Inspired Reinforcement Learning with Vision-Language Models for Safe and Deployable Autonomous Driving</a> <span class="research-related__year">2026</span></li>
      <li><a href="https://zihaosheng.github.io/NWM/">Breaking Survivorship Bias in Driving World Models</a> <span class="research-related__year">2026</span></li>
      <li><a href="https://arxiv.org/abs/2609.22582">Beyond the Leaderboard: Counterfactual Diagnosis of End-to-End and VLA Driving Policies Under Domain Shift</a> <span class="research-related__year">2026</span></li>
    </ul>
  </section>

  <section class="research-section" id="human-ai" aria-labelledby="human-ai-title">
    <h2 id="human-ai-title">Human-AI interaction</h2>
    <p>
      I contribute to Sky-Drive, Sky-Lab's open-source multi-agent simulation platform for socially aware and human-AI collaborative transportation research. It combines multi-modal human-in-the-loop simulation, a human-AI collaboration mechanism and digital twins of real transportation environments.
    </p>
    {% include figure.liquid path="assets/img/research/human-ai-collab.png" class="img-fluid rounded" alt="Sky-Drive LLMs for personalized driving: a human agent and an LLM-based driving agent exchange dialogue, perception and route plans in the simulator" zoomable=true %}

    <div class="research-projects">
      <div class="research-project">
        <h3>
          <img src="{{ '/assets/img/Sky-Drive.png' | relative_url }}" class="inline-logo" alt="SkyDrive">
          <a href="{{ '/projects/skydrive/' | relative_url }}">Sky-Drive</a>
        </h3>
        <p>
          A distributed, multi-agent human-in-the-loop, digital-twin-enabled traffic simulator that supports AV-VRU interaction modeling, socially aware reinforcement learning and personalized driving policy. The code is on <a href="https://github.com/BillWan-zzzyyy/Sky-Drive">GitHub</a>.
        </p>
      </div>
      <div class="research-project">
        <h3><a href="{{ '/projects/vru/' | relative_url }}">Study of vulnerable road users</a></h3>
        <p>
          This project studies vulnerable road user (VRU) behavior and AV-VRU interaction, building on the human-in-the-loop and digital-twin capabilities of Sky-Drive.
        </p>
        {% include figure.liquid path="assets/img/VRU.jpg" class="img-fluid rounded" alt="Vulnerable road user study with the Sky-Drive platform" zoomable=true %}
      </div>
    </div>

    <h3 class="research-related-title">Papers</h3>
    <ul class="research-related">
      <li><a href="https://www.sciopen.com/article/10.26599/JICV.2026.9210070">Sky-Drive: A Distributed Multi-Agent Simulation Platform for Socially-Aware and Human-AI Collaborative Future Transportation</a> <span class="research-related__year">2025</span></li>
      <li><a href="https://rosap.ntl.bts.gov/view/dot/89376">Using Connected Intelligent Transportation to Enhance Vulnerable Road User Safety</a> <span class="research-related__year">2025, CCAT report</span></li>
    </ul>

  </section>

  <section class="research-section" id="earlier-work" aria-labelledby="earlier-work-title">
    <h2 id="earlier-work-title">Earlier work</h2>
    <p>
      At Tongji University I worked on the Virtual Track Train (VTT), an urban transport system that combines the advantages of trams and buses on rubber wheels, with a hybrid human/driverless driving mode. I built a driving simulation platform for developing VTT trajectory-tracking control, with a dynamic model, driver-in-the-loop simulation and scenario visualization. I also studied VTT tire wear.
    </p>
    {% include figure.liquid path="assets/img/drivingsimulator.jpg" class="img-fluid rounded" alt="Driving simulation platform for the Virtual Track Train project" zoomable=true %}
    <p class="research-more"><a href="{{ '/projects/vtt/' | relative_url }}">More about the VTT driving simulation project</a></p>
    <h3 class="research-related-title">Papers</h3>
    <ul class="research-related">
      <li><a href="http://dskgjt.ijournals.cn/">Development of Driving Simulation Platform for Virtual Track Train</a> <span class="research-related__year">2024</span></li>
      <li><a href="https://journals.sagepub.com/doi/abs/10.1177/09544070241280744">Study of the Tire Wear of Virtual Track Train</a> <span class="research-related__year">2024</span></li>
    </ul>
  </section>

</div>
