# StoryAssembler

A narrative system for procedurally generating choice-based interactive narratives!  
  * Powered jointly by an HTN (hierarchical task network) planner and state-forward planner.  
  * Text and choices are dynamically assembled from pre-authored fragments that have effects.
  * Narratives are driven by lists of states which are reached by fragment effects.
  * Text templating is also available to make narratives dynamic on a word-by-word basis.

## How to Run (Mac)
1. Start up Terminal
2. Navigate to the StoryAssembler root directory
3. Type command to start up a Python webserver: `python -m SimpleHTTPServer`
4. Start a web browser and go to http://localhost:8000

## How to Run (Windows)
1. If you don't have Python, download it (2 or 3 is fine)
2. Start up Command
3. Navigate to the StoryAssembler root directory
4. Type command to start a webserver:  
  * Python 3: `python -m http.server`  
  * Python 2: `python -m SimpleHttPServer` 
6. Start a web browser and go to http://localhost:8000

## Example Scene
A simple example scene's files are located in  
  * js/StoryAssembler/data/scene-configs (the config file)  
  * js/StoryAssembler/data/scene-content (the content file)

## How Do I Start Writing?
Your best bet is to [check out the wiki](https://github.com/LudoNarrative/StoryAssembler/wiki), where there are some walkthroughs!

## Who's Used This Thing?
A version of this system was used to drive the narrative component of [_Emma's Journey_](https://emmasjourney.soe.ucsc.edu/), a generative game about climate change created by UC Santa Cruz.
