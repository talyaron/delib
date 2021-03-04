import m from 'mithril';
import store from '../../data/store';
import cytoscape from 'cytoscape';

var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in
  
    elements: [ // list of graph elements to start with
      { // node a
        data: { id: 'a' }
      },
      { // node b
        data: { id: 'b' }
      },
      { // edge ab
        data: { id: 'ab', source: 'a', target: 'b' }
      }
    ],
  
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
  
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ],
  
    layout: {
      name: 'grid',
      rows: 1
    }
  
  });


module.exports = {
    oninit:vnode=>{
        const {id} = vnode.attrs;
        store.lastPage = `/map/${id}`;
        sessionStorage.setItem("lastPage", store.lastPage);
    },
  
    view: vnode => {
       
        return (

           <div id='cy'>Map</div>

        )

        
    }
}