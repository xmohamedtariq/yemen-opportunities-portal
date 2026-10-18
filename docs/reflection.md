# Project Reflection — Yemen Opportunities Portal

## Overview

Building the Yemen Opportunities Portal was not only a frontend development task. It required me to make product, data, security, testing, and deployment decisions while keeping human review at the center of the workflow.

The project was designed for Yemeni students and youth who need a reliable place to discover scholarships, internships, fellowships, free courses, and training opportunities. One of my most important decisions was to avoid automatic scraping and AI-generated opportunity data. Instead, I manually reviewed the production opportunities against official sources and maintained verification dates for the dataset.

## What I Learned

The strongest lesson was that AI agents are useful for implementation and verification, but they still require clear constraints and human review. I used a Plan -> Human Review -> Approval -> Implementation -> Browser Test -> Evidence -> Commit workflow. This helped prevent unreviewed changes from entering the project.

I also learned that passing automated tests is not the same as proving that a product works for real users. The project therefore includes automated browser regression tests, responsive 360px verification, offline tests, and a real physical-device test on an iPhone using Safari.

The Service Worker was an important technical decision. It allows the core portal to remain usable after the first successful online load. I verified this behavior both in browser testing and on a real iPhone in Safari by loading the portal online first, disconnecting the device from the network, and confirming that the cached portal still worked.

## Human Review and AI Limitations

Human review was especially important for opportunity data. The AI was not allowed to invent opportunities, silently modify deadlines, or automatically approve user suggestions. Production data remained separate from pending suggestions, and the final dataset was validated after human verification.

Another important lesson was to document limitations honestly. A native browser recording was not available in the final autonomous browser environment, so I did not claim that one existed. Instead, the project preserves real browser screenshots, test outputs, and written evidence.

## What I Would Do Differently

If I continued the project, I would add more structured real-user usability sessions across different devices and network conditions, while keeping opportunity approval under human control. I would also introduce a carefully designed moderation workflow for community-submitted opportunities without allowing automatic publication.

## Final Reflection

The final result is more than a static website. It is a bilingual, mobile-friendly, offline-capable opportunity discovery system with verified data, safe client-side behavior, reproducible tests, security evidence, and a clear Git history.

The most valuable part of the project was learning how to combine AI-assisted development with human responsibility. AI accelerated planning, implementation, and testing, but final decisions about data quality, approvals, evidence, and deployment remained under human control.
