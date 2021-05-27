const emitter = mitt();     //the event bus

//State variable is  provided by sample.js. (included in index.html  Will move to SPA later on...)
State.loadMap();    //load the ConceptMap and create the hashMap. 


//the Vue application object
const app = Vue.createApp({
    created()  {
        //listen to all events through the event bus
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

app.mount("#app");