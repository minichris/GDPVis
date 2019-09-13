import AllPatterns from './generators/AllPatterns.js';
import DataOutput from './output/DataOutput.js';
import FilterPatternsByCategory from './filters/FilterPatternsByCategory.js';

export default {
    list : [
        new AllPatterns,
        new DataOutput,
        new FilterPatternsByCategory
    ],
    get(name) {
        const comp = this
            .list
            .find(item => item.name.toUpperCase() === name.toUpperCase());

        if (!comp) 
            throw new Error(`Component '${name}' not found`);
        return comp;
    }
};