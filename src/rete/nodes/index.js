import AllPatterns from './generators/AllPatterns.js';
import AllGames from './generators/AllGames.js';

import FilterPatternsByCategory from './filters/FilterPatternsByCategory.js';
import FilterGamesByCategory from './filters/FilterGamesByCategory.js';
import FilterPatternsByLinkedToGame from './filters/FilterPatternsByLinkedToGame.js';
import FilterGamesByLinkedToPattern from './filters/FilterGamesByLinkedToPattern.js';

import DataOutput from './output/DataOutput.js';

export default {
    list : [
        new AllPatterns,
        new AllGames,
        new FilterPatternsByCategory,
		new FilterGamesByCategory,
		new FilterPatternsByLinkedToGame,
		new FilterGamesByLinkedToPattern,
        new DataOutput
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