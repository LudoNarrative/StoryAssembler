# StoryAssembler

A narrative system for procedurally generating choice-based interactive narratives!  
  * Powered jointly by an HTN (hierarchical task network) planner and forward-state planner.  
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
All the tutorials, walkthroughs, and technical explanations live in [the wiki](https://github.com/LudoNarrative/StoryAssembler/wiki)

## Why Would I Want To Write With This Thing?
StoryAssembler's good for creating [quality-based narratives](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/). In general it's good if you want to write a story where any of these are true:
* most choices are gated by certain conditions
* how the story progresses is dynamically determined via state
* you want game variables from a concurrent game to influence the direction of the story or choice availability

The dynamic templating system means it's also good if: 
* you want to write stories where different characters take on story roles
* individual qualities of characters influence choices or structure of the story

## Who's Used This Thing?
A version of this system was used to drive the narrative component of [_Emma's Journey_](https://emmasjourney.soe.ucsc.edu/), a generative game about climate change created by UC Santa Cruz.

## I Heard There's A Cool Narrative Viz For This Thing!
There's a viz for an older version of this library [here](https://people.ucsc.edu/~jgarbe/demo/StoryAssembler/editor.html), but because it still has some pernicious bugs, we're not including it in the library (for now).
