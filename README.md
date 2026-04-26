## Inspiration
Our inspiration was noticing that many people faced difficulty gaining instant access to information about organisms seen in a screenshot the user provides. 

## What it does
From opening up the extensions shortcut on the user's PC, the user is able to take a screenshot of an organism they see, and the integrated AI inside the program analyzes the image to provide details like...
- Organism's common & scientific name
- Organism's characteristics & traits
      - Including whether the traits are recessive or dominant 
             - The trait's genotype (including underscore if you cannot tell if it's heterozygous dominant or                homozygous dominant)
                   - Say if it is incomplete dominance or complete dominance
                   - Say if it is codominant

## How we built it
We built an extension using Python, CSS, HTML, JavaScript, and we integrated Groq into the program using its API Key. 

## Challenges we ran into
- The program's logo is not being properly visible inside the extension. 
- Dragging and selecting screenshots inside the extension
- AI knowing too much information, including polygenic traits (which is much more complex than we wanted to do in this extension); the AI not giving data back in the proper structure we wanted it in. 

## Accomplishments that we're proud of
- Entirely achieving the true purpose of the program we created
- Troubleshooting and debugging until all of our bugs and challenges were eventually fixed

## What we learned
This was our first time creating an extension, and we learned how to make complex response schemas. We also decided to play around with and tweak the logo, which we were proud of crafting.

## Why an extension?
Through the fun and frustration of creating an extension, specifically a chrome extension, it can be easy to lose sight of the entire purpose of creating one in the first place. The reason why this program couldn't instead be a website is because it needs to be able to take screenshots in any website. This functionality is not possible if the app was built in a website, but is perfect as a chrome extension.

## During vs After Hackathon
All portions of the extension were built during the hackathon. However, the website was built after the hackathon. Furthermore, the backend was built during the hackathon too.
(Anything in the backEnd and Extension folders are from during the hackathon. Anything in the Website folder were created after the hackathon.)
