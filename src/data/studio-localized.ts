import { capabilities, workflow, collaborations, faqs } from './studio';
import type { Locale } from './i18n';
const capabilitiesEn = [
 {title:'Story & experience',short:'Find the story. Enter the world.',description:'We begin with cultural context, character relationships and the theme of an experience, shaping content into a journey through space. The audience’s role, actions and emotions give each scene a purpose.',deliverables:['Themes and content structure','Experience pathways and chapters','Characters and interaction concepts'],caption:'Taosi · City gates and ceremonial platform'},
 {title:'Art & world building',short:'Give imagination a visible form.',description:'Architecture, characters, materials and light define the personality of a world. From the presence of a cultural setting to the playfulness of a miniature adventure, each story calls for its own visual language.',deliverables:['Visual direction and style','Environments and character design','Lighting and visual atmosphere'],caption:'Zhong Kui · Fantastical architecture'},
 {title:'Interaction & space',short:'Let participation move the story.',description:'Watching, walking, exploring and meeting characters form a connected experience. We develop interaction points, scene transitions and feedback around the story, giving the audience’s actions a meaningful place within it.',deliverables:['Narrative rhythm in space','Participation and feedback','Scene transitions and continuity'],caption:'Larva · A playful world'},
];
const workflowEn = [
 {title:'Discover',text:'Understand the content, audience and setting to define the core experience the project should convey.',output:'Establish shared project goals'},
 {title:'Define',text:'Develop narrative pathways and visual directions, turning ideas into proposals that can be reviewed together.',output:'Agree on scope and visual direction'},
 {title:'Create',text:'Develop the agreed content in stages, reviewing both the imagery and the experience as the work evolves.',output:'Refine the work through staged reviews'},
 {title:'Deliver',text:'Align the final materials with the agreed use, organizing assets, versions and collaboration information.',output:'Deliver against the agreed project scope'},
];
const collaborationsEn = [
 {title:'Content co-creation',intro:'New ways to experience culture and IP.',text:'A story, a collection of cultural references or a distinctive character can be the starting point. We can begin by discussing the theme, audience and setting of the experience.',topics:['Cultural content and tourism themes','Brands and character IP','Immersive experience concepts'],linkLabel:'Explore the cultural narrative of Taosi'},
 {title:'Production collaboration',intro:'Different disciplines. One shared work.',text:'When a project already has a clear direction, we can discuss the division of work across visuals, environments, characters and interaction, aligning scope and delivery standards together.',topics:['Visual development and digital environments','Characters and content expression','Staged production and integration'],linkLabel:'Explore the world of Zhong Kui'},
 {title:'Spatial experiences',intro:'From a digital world to a physical experience.',text:'For cultural destinations, exhibitions and experience spaces, we consider site conditions, visitor journeys and operational needs when discussing how content can be presented and implemented.',topics:['Cultural destinations and exhibitions','Brand experience spaces','Adapting content to its setting'],linkLabel:'Enter the world of Larva'},
];
const faqsEn = [
 {question:'What should we prepare before getting in touch?',answer:'A project background, intended audience, setting and any existing content or visual material are helpful. If you already have a budget range and timeline, sharing them will help us discuss a suitable scope.'},
 {question:'Can we start with an idea rather than a complete brief?',answer:'Yes. We can begin with a theme and the intended experience. An existing story, IP or venue can also provide a starting point for defining the content and how we might work together.'},
 {question:'Can you collaborate on one part of an existing project?',answer:'We can discuss a specific production stage. We would first align on the existing proposal, asset specifications, responsibilities and expected deliverables to establish a suitable scope.'},
 {question:'How are the schedule and deliverables decided?',answer:'They depend on the amount of content, production scope, technical requirements and review process. Once the requirements are clear, we agree on project stages, timing and delivery standards.'},
];
export function studioData(locale: Locale) {
 return {
  capabilities: capabilities.map((item,i)=>({...item,...(locale==='en'?capabilitiesEn[i]:{})})),
  workflow: workflow.map((item,i)=>({...item,...(locale==='en'?workflowEn[i]:{})})),
  collaborations: collaborations.map((item,i)=>({...item,...(locale==='en'?collaborationsEn[i]:{})})),
  faqs: locale==='en'?faqsEn:faqs,
 };
}
