//Adds the State variable to the window object. OK for prototyping...
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
                    if (group.source == 'http://clinfhir.com/ns/clinFHIRLab' &&
                        group.target == 'http://loinc.org') {
                            group.element.forEach(function (element) {
                                //let key = 
                                hash[element.code] = element.target[0].code
                            })
                    }
                })
                that.hashMap = hash

            })
        })
    }


    //function to load lab data, and convert to an internal object for display
    state.loadData = function(identifier) {
        //console.log(this.hashMap)
       
        return new Promise((resolve,reject)=> {
            //let url = "http://home.clinfhir.com:8054/baseR4/Observation?patient.identifier=http://clinfhir.com|abc1234"
            let url = "http://home.clinfhir.com:8054/baseR4/Observation?patient.identifier=" + identifier;
            console.log(url)
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