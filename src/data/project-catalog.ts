import {getCollection} from 'astro:content';

// One public roster drives navigation, home, work pages and the next-project cycle.
export async function getVisibleProjects(){
 return (await getCollection('projects',({data})=>data.listed)).sort((a,b)=>a.data.order-b.data.order);
}
