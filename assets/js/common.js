$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  function togglePublicationPanel(control, panelClass) {
    const publication = control.parent().parent();
    const panel = publication.find(`.${panelClass}.hidden`);
    const willOpen = !panel.hasClass("open");

    publication.find(".abstract.hidden.open, .award.hidden.open, .bibtex.hidden.open").removeClass("open");
    publication.find("a.abstract, button.abstract, a.award, button.award, a.bibtex, button.bibtex").attr("aria-expanded", "false");

    if (willOpen) {
      panel.addClass("open");
      control.attr("aria-expanded", "true");
    }
  }

  $("a.abstract, button.abstract").click(function () {
    togglePublicationPanel($(this), "abstract");
  });
  $("a.award, button.award").click(function () {
    togglePublicationPanel($(this), "award");
  });
  $("a.bibtex, button.bibtex").click(function () {
    togglePublicationPanel($(this), "bibtex");
  });

  $("button.more-authors").click(function () {
    const control = $(this);
    const expanded = control.attr("aria-expanded") === "true";
    const collapsedText = control.attr("data-collapsed-text");
    const expandedText = control.attr("data-expanded-text");
    control.text(expanded ? collapsedText : expandedText);
    control.attr("aria-expanded", expanded ? "false" : "true");
    control.attr("title", expanded ? `Show ${collapsedText}` : `Hide ${collapsedText}`);
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
