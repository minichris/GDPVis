import AllPatterns from './generators/AllPatterns.js';
import AllGames from './generators/AllGames.js';

import FilterPatternsByCategory from './filters/FilterPatternsByCategory.js';
import FilterGamesByCategory from './filters/FilterGamesByCategory.js';
import FilterPatternsByLinkedToGame from './filters/FilterPatternsByLinkedToGame.js';
import FilterGamesByLinkedToPattern from './filters/FilterGamesByLinkedToPattern.js';

import FilterPatternsByThoseFoundInGames from './filters/FilterPatternsByThoseFoundInGames.js';
import FilterGamesByThoseWhichUsePatterns from './filters/FilterGamesByThoseWhichUsePatterns.js';

import ArrayUnion from './combiners/ArrayUnion.js';
import ArrayIntersection from './combiners/ArrayIntersection.js';
import ArrayDifference from './combiners/ArrayDifference.js';

import DataOutput from './output/DataOutput.js';

export default {
    list : [
        new AllPatterns,
        new AllGames,
        new FilterPatternsByCategory,
		new FilterGamesByCategory,
		new FilterPatternsByLinkedToGame,
		new FilterGamesByLinkedToPattern,
		new FilterPatternsByThoseFoundInGames,
		new FilterGamesByThoseWhichUsePatterns,
		new ArrayUnion,
		new ArrayIntersection,
		new ArrayDifference,
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