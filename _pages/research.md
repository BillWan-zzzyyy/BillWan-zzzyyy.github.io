---
layout: page
permalink: /research/
title: Research
description: Autonomous driving and human-centered intelligent transportation, from simulation to real vehicles.
nav: true
nav_order: 1
---

<div class="research-page">
  <p class="research-intro">I want driving policies that are learned in simulation to hold up on a real vehicle. That takes three things, and my work follows them in order: a simulator that includes people, a way to teach policies what is unsafe, and a way to carry them onto the road.</p>
  <ol class="research-timeline">
    <li class="research-step" id="human-ai">
      <div class="research-step__year">2025</div>
      <div class="research-step__content">
        <div class="research-step__media">
          {% include figure.liquid path="assets/img/research/human-ai-collab.png" class="img-fluid" sizes="(min-width: 768px) 200px, 100vw" alt="Sky-Drive LLMs for personalized driving: a human agent and an LLM-based driving agent exchange dialogue, perception and route plans in the simulator" zoomable=true %}
        </div>
        <div class="research-step__body">
          <p class="research-step__kicker">Simulate with people in the loop</p>
          <h2 class="research-step__title">Human-AI interaction</h2>
          <p>Sky-Drive is Sky-Lab's open-source multi-agent simulator, where human drivers, pedestrians and AI agents share one digital twin. We use it to study how autonomous vehicles interact with vulnerable road users.</p>
          <p class="research-step__links"><a href="https://www.sciopen.com/article/10.26599/JICV.2026.9210070">Sky-Drive</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="https://rosap.ntl.bts.gov/view/dot/89376">VRU safety report</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="https://github.com/BillWan-zzzyyy/Sky-Drive">Code</a></p>
        </div>
      </div>
    </li>
    <li class="research-step" id="vlm-world-models">
      <div class="research-step__year">2026</div>
      <div class="research-step__content">
        <div class="research-step__media">
          {% include figure.liquid path="assets/img/research/vlm-driving.png" class="img-fluid" sizes="(min-width: 768px) 200px, 100vw" alt="DriveVLM-RL: VLM-as-control and VLM-as-reward paradigms and the dual-pathway DriveVLM-RL framework" zoomable=true %}
        </div>
        <div class="research-step__body">
          <p class="research-step__kicker">Teach policies what is unsafe</p>
          <h2 class="research-step__title">VLMs and world models</h2>
          <p>Vision-language models give the driving agent semantic safety rewards during training and are removed at deployment. I also study how world models and end-to-end policies fail in rare, dangerous scenes.</p>
          <p class="research-step__links"><a href="https://arxiv.org/abs/2603.18315">DriveVLM-RL</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="https://zihaosheng.github.io/NWM/">NWM</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="https://arxiv.org/abs/2609.22582">Beyond the Leaderboard</a></p>
        </div>
      </div>
    </li>
    <li class="research-step" id="sim-to-real">
      <div class="research-step__year">2026</div>
      <div class="research-step__content">
        <div class="research-step__media">
          {% include figure.liquid path="assets/img/research/sim2real.jpg" class="img-fluid" sizes="(min-width: 768px) 200px, 100vw" alt="Sim2Real-AD real-vehicle platform: lab-developed Ford E-Transit autonomous van with lidars, cameras, radar and the camera configuration" zoomable=true %}
        </div>
        <div class="research-step__body">
          <p class="research-step__kicker">Carry them onto the road</p>
          <h2 class="research-step__title">Sim-to-real driving</h2>
          <p>Sim2Real-AD runs CARLA-trained, VLM-guided reinforcement-learning policies on a full-scale van, with no real-world RL training data.</p>
          <p class="research-step__links"><a href="https://arxiv.org/abs/2604.03497">Sim2Real-AD</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="https://zilin-huang.github.io/Sim2Real-AD-website/">Project page</a></p>
        </div>
      </div>
    </li>
    <li class="research-step research-step--note" id="earlier-work">
      <div class="research-step__year">2018–2025</div>
      <div class="research-step__content">
        <div class="research-step__body">
          <h2 class="research-step__title">Before that</h2>
          <p>I did my B.E. and M.S. at Tongji University, where I built a driving simulation platform for the Virtual Track Train and studied its tire wear. That work is what sparked my interest in the research I do now. I'm grateful to my advisor <a href="https://tjjt.tongji.edu.cn/info/2943/10933.htm">Prof. Hechao Zhou</a> and to my labmates Juyao Wei and Mingsu Mei for their help along the way.</p>
          <p class="research-step__links"><a href="http://dskgjt.ijournals.cn/">Simulation platform</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="https://journals.sagepub.com/doi/abs/10.1177/09544070241280744">Tire wear</a>&nbsp;<span class="research-step__sep" aria-hidden="true">•</span> <a href="{{ '/projects/vtt/' | relative_url }}">VTT project</a></p>
        </div>
      </div>
    </li>
  </ol>
</div>

<script>
(function () {
  // Progressive enhancement: everything is visible without this script. It only
  // grows the red rail with scroll and marks the dots it has passed.
  var list = document.querySelector(".research-timeline");
  if (!list) return;
  var steps = Array.prototype.slice.call(list.querySelectorAll(".research-step"));
  if (!steps.length) return;
  var queued = false;
  function dotY(step) {
    var offset = parseFloat(getComputedStyle(step).getPropertyValue("--dot-y")) || 0;
    return step.getBoundingClientRect().top + offset;
  }
  function update() {
    queued = false;
    var ys = steps.map(dotY);
    var first = ys[0];
    var span = ys[ys.length - 1] - first;
    var doc = document.documentElement;
    var atBottom = window.innerHeight + window.pageYOffset >= doc.scrollHeight - 2;
    var reach = atBottom ? Infinity : window.innerHeight * 0.6;
    var progress = Math.min(Math.max(reach - first, 0), span);
    list.style.setProperty("--research-progress", progress + "px");
    steps.forEach(function (step, i) {
      step.classList.toggle("is-reached", ys[i] <= reach);
    });
  }
  function request() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request, { passive: true });
  window.addEventListener("load", request);
  update();
})();
</script>
