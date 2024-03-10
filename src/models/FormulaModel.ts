import { ELEMENT_NAME_PARTS, SUBSCRIPTS } from "../constants/Constants";
import BaseModel from "./BaseModel";

/**
 * Basically an element plus count of how many 
 */
class Component {
    atomicNumber : number
    count : number

    constructor() {

    } 
    
    static new(atomicNumber : number, count : number) {
        let component = new Component();
        component.atomicNumber = atomicNumber;
        component.count = count;
        return component;
    }

    static copy(obj : any) {
        let component = new Component();
        Object.assign(component, obj);

        return component;
    }

    toString(isSymbol=true) : string {
        let num = this.atomicNumber;

        num--;
        let nameArr: Array<string> = [];
        do {
            let i = num % (ELEMENT_NAME_PARTS.length);
            nameArr.push(isSymbol ? ELEMENT_NAME_PARTS[i].code : ELEMENT_NAME_PARTS[i].name);
            num /= ELEMENT_NAME_PARTS.length;
            num = Math.floor(num);
        } while (num > 0);
    
        let name = nameArr.reverse().join("");
    
        if (!isSymbol) {
            //TODO: Change suffix based on count
            name += "ium";
            name = name.replace("aa", "a");
            name = name.replace("ii", "i");
            name = name.replace("kk", "k");
        } else {
            if(this.count > 1 && this.count < SUBSCRIPTS.length) {
                name += SUBSCRIPTS[this.count];
            } else if(this.count >= SUBSCRIPTS.length) {
                //Turn count into a char array, turn that into subscript chars, then restringify
                let subscript = [...this.count.toString()].map(c => SUBSCRIPTS[parseInt(c)]).reduce((a,b)=>a+b)

                name += subscript;
            }
        }
    
        return name.charAt(0).toUpperCase() + name.substring(1);
    }
}

/**
 * Represents a basic chemical formula like H2O (but in fictional simplified chemistry)
 */
export default class FormulaModel implements BaseModel {
    components : Array<Component>

    constructor() {
        this.components = [];
    }

    static newUnary(atomicNumber : number) {
        let form = new FormulaModel();
        form.components.push(Component.new(atomicNumber, 1));
        return form;
    }

    static copy(obj : any) {
        let formula = new FormulaModel();
        Object.assign(formula, obj);
        formula.components = (obj.components as Array<any> ).map(c => Component.copy(c))

        return formula;
    }

    isUnary() {
        return this.components.length == 1 && this.components[0].count == 1;
    }

    /**
     * As in two Hydrogen atoms combining to become a Helium
     */
    static fuse(modelA : FormulaModel, modelB: FormulaModel) : FormulaModel | null {
        if(!modelA.isUnary() || !modelB.isUnary()) return null;

        let newModel = new FormulaModel();
        newModel.components.push(Component.new( modelA.components[0].atomicNumber + modelB.components[0].atomicNumber, 1 ));

        return newModel;
    }

    /**
     * As in Sodium and Chlorine becoming salt
     */
    static merge(modelA : FormulaModel, modelB: FormulaModel) : FormulaModel {
        let combinedComponents = modelA.components.map( c => Component.copy(c));
        
        modelB.components.forEach( (newComponent) => {
            let existingComponent = combinedComponents.find( (candidate) => candidate.atomicNumber === newComponent.atomicNumber );
            if(existingComponent) {
                existingComponent.count += newComponent.count;
            } else {
                combinedComponents.push(Component.copy(newComponent));
            }
        });

        let model = new FormulaModel();
        model.components = combinedComponents;

        return model;
    }

    toString(isSymbol=true) : string {
        return this.components.map(c => c.toString(isSymbol)).reduce( (a, b) => a+b);
    }
}