//Adds the State variable to the window object. Kind of like a service in angularJS. OK for prototyping...
window.State = (function(){

    const state = {}

    state.identifier = "abc1234"

    //function to get the ConceptMap and create the mapping hash  
    state.loadMap = function() {
        let that = this;
        return new Promise((resolve,reject) => {
            let url = "https://r4.ontoserver.csiro.au/fhir/ConceptMap/ClinFHIRLabToNZPOC"

            axios.get(url).then(function(data) {
                let conceptMap = data.data
                let hash = {}   //will hold the translated code from bespoke lab to NZPOC
                //iterate through the groups & elements to create the hash. No error checking performed.
                conceptMap.group.forEach(function(group){

                    //if (group.source == 'http://clinfhir.com/ns/clinFHIRLab') {
                            group.element.forEach(function (element) {
                                let mapFrom = group.source + "#" + element.code
                                let mapTo = group.target + "#" + element.target[0].code   //assume only 1
                                hash[mapFrom] = mapTo
                            })
                   // }
                })
                that.hashMap = hash

                //create a list of the hash for display...
                let hashDisplay = []
                Object.keys(hash).forEach(function(key){
                    let map = hash[key]
                    hashDisplay.push({key:key,map:map})
                })

                //tell the component it's ready....
                emitter.emit('hash',hashDisplay)

            })
        })
    }


    //function to load lab data, and convert to an internal object for display
    //not doing any error checking

    state.loadData = function(identifier) {
        //console.log(this.hashMap)
       
        return new Promise((resolve,reject)=> {
            //don't include the system in the identifier query for now...
            let url = "http://home.clinfhir.com:8054/baseR4/Observation?patient.identifier=" + identifier;
           
            axios.get(url).then(function(data) {
                //convert Bundle to data 
                console.log(data)
                let arObservations = []
                let bundle = data.data;
                if (bundle && bundle.entry) {
                    bundle.entry.forEach(entry => {
                        let resource = entry.resource
                        let observation = {name:resource.code.coding[0].display}
    
                        observation.resource = resource;    //So we can get at the details if needed...
                        observation.date = resource.effectiveDateTime;
                        
                        arObservations.push(observation)
                    });
                }
            
                resolve(arObservations)
            })
    
    })}

    
    return state;



}())