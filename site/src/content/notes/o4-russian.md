---
title: "o4-mini-high inexplicably inserted Russian into my code"
date: 2025-04-28
slug: o4-russian
tags: ["ai", "llm", "coding"]
---

I'm working on a project and I wanted to make a minor edit but didn't want to hunt for the one line to change, so I put my script.js file into ChatGPT and asked it to make the change using the o4-mini-high model and Canvas.

It made the change correctly in the Canvas, but it also did one more thing: **it replaced the variable `document`, in all but two places, with the Russian word for document (документ).**

I've included the prompt below, as well as a PDF showing the diff of the file before and after. The Russian starts on page 5.

Wonky.

---

The prompt:
```
When I'm sliding the slider, the time (in the upper left of the screen in the box) should be automatically updating to where the slider is, even before the slider is released. Accordingly, the heatmap animation should be showing whatever time is being slid over on the slider. So when you drag the slider, the map changes, as does the time. Adjust the script.js to accomplish this.
```

The diff:

<iframe src="https://bucket.thomasdhughes.com/o4-mini-high-russian-diff-20260225-170700.pdf" style="width:100%;height:90vh;border:none;"></iframe>

(It also inserted a typo on line 55. Super wonky.)
