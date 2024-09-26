<script setup>
import { onMounted, reactive, createApp, computed } from 'vue'
import * as d3 from 'd3';
import HierarchyNode from '@/components/HierarchyNode.vue';

let props = defineProps({
  peopleData: {
    type: Object,
    required: true
  },
  treeId: {
    type: String,
    required: true
  }
})

const marginTop = 40
const siblingGap = 1.1
const cousinGap = 1.5
const levelHeight = 450
const dx = 260
const dy = 360

// Collapse the node and all it's children
const collapse = (node) => {
  if (node.children) {
    node._children = node.children;
    node._children.forEach(collapse);
    node.children = null;
  }
}

// create vertical paths from parent to children, determines the shape
const drawNodeLink = (node) => {
  const m = 'M' + node.source.x + ',' + node.source.y
  const q = 'Q' + (node.target.x) + ',' + (node.target.y - 22) + ',' + (node.target.x) + ',' + (node.target.y)
  const v = 'V' + (node.target.y - (levelHeight / 20))
  const h = 'H' + node.target.x
  return  m + v + h + q
}

onMounted(() => {
  // Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
  // (dx is a height, and dy a width). This because the tree must be viewed with the root at the
  // “bottom”, in the data domain. The width of a column is based on the tree’s height.
  const root = d3
    .stratify()
    .id((node) => node['Employee Id'])
    .parentId((node) => node['Manager'])
    (props.peopleData);

  // Define the tree layout and the shape for links.
  const tree = d3
    .tree()
    .nodeSize([dx, dy])
    .separation((a, b) => (a.parent == b.parent ? siblingGap : cousinGap));

  // svg takes height and width of parent when not specified. See element for the tree id. Also set the view box to the
  // entire screen and shift it on the x-axis by negative width/2 so the root node ends up in the center.
  // Create the SVG container, a layer for the links and a layer for the nodes. Set initialize size to the size of 1 node
  const svg = d3
    .select('#' + props.treeId)
    .append('svg')
    .attr('viewBox', [-window.screen.width/2, -marginTop, window.screen.width, window.screen.height]);

  const gLink = svg.append('g')
    .attr('fill', 'none')
    .attr('stroke', '#a8a8a8')
    .attr('stroke-width', 2);

  const gNode = svg.append('g')
    .attr('cursor', 'pointer');

  // apply transformations on zoom
  const zoomBehaviours = d3
    .zoom()
    .scaleExtent([0.2, 1.5])
    .on('zoom', function (event){
      gNode.attr('transform', event.transform);
      gLink.attr('transform', event.transform);
    });

  // add zoom and drag behavior to element
  svg.call(zoomBehaviours)
    .call(zoomBehaviours.transform, d3.zoomIdentity.scale(0.5)); // set initial zoom

  // run every time we want to update tree state
  function update(event, source) {
    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    // Compute the new tree layout.
    tree(root);

    // Normalize for fixed-depth.
    nodes.forEach(function(node) {
      node.y = node.depth * levelHeight;
    });

    const transition = svg.transition()
      .duration(duration)
      .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch('toggle'));

    // Update the nodes…
    const node = gNode
      .selectAll('g')
      .data(nodes, node => node.id);

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('transform', node => `translate(${source.x0},${source.y0})`)
      .classed('group', true) // triggers on hover styling in HierarchyNode component, useful since want to change styling even if the node is hovered on since the shadow is part of the node, can't put shadow outside node
      .on('click', (event, node) => {

        node.children = node.children ? null : node._children;

        // if the nodes children are null, ie we have clicked to close the card then we need to also collapse
        // of the descendant children of this node recursively so that when we reopen it only opens 1 level
        // is opened and not all the previous levels that existed prior to the close.
        if (!(typeof node.children == "undefined")) {
          node._children.forEach((node) => collapse(node));
        }

        update(event, node);
      })

    // create a HierarchyNode component and add the rendered html to the node
    nodeEnter.html((node) => {
      let elm = document.createElement('foreignObject');
      elm.setAttribute('x', -dx/2);
      elm.setAttribute('y', 0);
      elm.setAttribute('width', dx);
      elm.setAttribute('height', dy);
      elm.setAttribute('overflow', 'visible');

      // const department = getDepartmentColor(node.data['Department'])

      createApp(HierarchyNode, reactive({
          person: node,
          data: props.peopleData,
          node
          // departmentColor: department
        }))
        .mount(elm);
      return elm.outerHTML;
    });

    // Transition nodes to their new position.
    const nodeUpdate = node.merge(nodeEnter).transition(transition)
      .attr('transform', node => `translate(${node.x},${node.y})`)
      .attr('fill-opacity', 1);

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node.exit().transition(transition).remove()
      .attr('transform', node => `translate(${source.x},${source.y})`)
      .attr('fill-opacity', 0);

    // Update the links…
    const link = gLink.selectAll('path')
      .data(links, node => node.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter()
      .append('path')
      .attr('d', node => {
        return drawNodeLink(node);
      });

    // Transition links to their new position.
    link.merge(linkEnter)
      .transition(transition)
      .attr('d', node => drawNodeLink(node));

    // Transition exiting nodes to the parent's new position.
    link.exit()
      .transition(transition)
      .remove()
      .attr('d', node => {
        return drawNodeLink(node);
      });

    // Stash the old positions for transition.
    root.eachBefore(node => {
      node.x0 = node.x;
      node.y0 = node.y;
    });
  }

  // Do the first update to the initial configuration of the tree — where a number of nodes
  // are open (arbitrarily selected as the root).
  root.y0 = dy / 2;
  root.x0 = 0;
  root.descendants().forEach((node, i) => {
    node.id = i;
    node._children = node.children;
    if (node.depth) node.children = null;
  });

  // shows first level from root if commented
  // collapse(root)
  update(null, root);
})

</script>

<template>
  <div :id='props.treeId' class='w-screen h-screen'></div>
</template>
