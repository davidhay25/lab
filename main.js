const emitter = mitt();     //the event bus

//State variable is  provided by sample.js. (included in index.html  Will move to SPA later on...)
State.loadMap();    //load the ConceptMap and create the hashMap. 


//the Vue application object
const app = Vue.createApp({
    data() {
        return {
          currentTab: 'Query',
          tabs: ['Query', 'Map']
        }
      },
      computed: {
        currentTabComponent() {
          return 'tab-' + this.currentTab.toLowerCase()
        }
      },
    created()  {
        //listen to all events through the event bus so they can be logged...
        emitter.on('*', (name, e) => console.log("Event:" + name, e) )
    }
})

//select a patient component definition
const selectPatient = {
    emits : ['selectpatient'],
    data() {
        return {
            identifier : State.identifier // "ABC1234"
        }
    },
    methods: {
        select(){
            console.log('select')
            emitter.emit('selectpatient',this.identifier)
        }
    },
    template: `
        <span>
            <input v-model="identifier" />
        </span>
        <button @click="select">Load</button>
    `
}
app.component('select-patient',selectPatient)

//list observations for a given identifier
const listObservations = {
    template: `
       
        <table class="table is-bordered">
            <thead>
                <tr><th>Date</th><th>Name</th><th>Value</th><th>Source Code</th><th>Mapped Code</th></tr>
            </thead>
        <tbody>
            <tr v-for = "observation in observations">
                <td>{{observation.date}}</td>
                <td>{{observation.name}}</td>
                <td>{{observation.valueDisplay}}</td>
                <td>{{observation.sourceCode}}</td>
                <td>{{observation.code}}</td>
               
            </tr>
        </tbody>
        </table>
       
    `,
    data() {
        return {
            observations:  []
        }
    },
    methods : {
        load(identifier) {
            this.observations.length = 0
            let that = this;
            State.loadData(identifier).then(function(data) {
                console.log(data)
                that.observations = data;                
            })
        }
    }, 
    created()  {
        emitter.on('selectpatient',(identifier) => {
            console.log('selectpatient event in list',identifier)
            this.load(identifier)
        })
    }
}
app.component('list-observations',listObservations)

//display the mapping from the ConceptMap
const conceptMap = {
   
    data() {
        return {
            mapList : [] 
        }
    },

    template: `
        <table class="table is-bordered">
            <thead>
                <tr><th>Source Code</th><th>Target code</th></tr>
            </thead>
        <tbody>
            <tr v-for = "map in mapList">
                <td>{{map.key}}</td>
                <td>{{map.map}}</td>
            </tr>
        </tbody>
    </table>

        
    `, 
    created()  {

        if (this.mapList.length == 0) {
            console.log('list is empty')
            this.mapList = State.hashDisplay
        }

       // emitter.on('hash',(mapList) => {        
        //    this.mapList = mapList
      //  })

    }
}
app.component('concept-map',conceptMap)


//experiment with tabs: https://codepen.io/team/Vue/pen/oNXaoKy
app.component('tab-query', {
    template: `
        <div class="demo-tab">
            <select-patient></select-patient>
            <list-observations> </list-observations>
        </div>`
})
app.component('tab-map', {
    template: `
        <div class="demo-tab">
            <concept-map> </concept-map>
            <!-- <button @click="load">Load</button> -->
        </div>`
})




app.mount("#app");