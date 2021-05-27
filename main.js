const emitter = mitt();     //the event bus

//State variable is  provided by sample.js. (included in index.html  Will move to SPA later on...)
State.loadMap();    //load the ConceptMap and create the hashMap. 


//the Vue application object
const app = Vue.createApp({
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
                <tr><th>Date</th><th>Name</th><th>Value</th></tr>
            </thead>
        <tbody>
            <tr v-for = "observation in observations">
                <td>{{observation.date}}</td>
                <td>{{observation.name}}</td>
                <td>{{observation.value}}</td>
                <td>{{observation.resource.code}}</td>
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
        emitter.on('hash',(mapList) => {
            //console.log('selectpatient event in list',identifier)
            this.mapList = mapList
        })
    }
}
app.component('concept-map',conceptMap)


//experiment with tabs: https://codepen.io/team/Vue/pen/oNXaoKy


app.mount("#app");