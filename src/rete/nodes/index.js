import AllPatterns from './generators/AllPatterns.js';
import AllGames from './generators/AllGames.js';

import FilterPatternsByCategory from './filters/FilterPatternsByCategory.js';
import FilterGamesByCategory from './filters/FilterGamesByCategory.js';

import FilterPatternsByLinkedToGame from './filters/FilterPatternsByLinkedToGame.js';
import FilterGamesByLinkedToPattern from './filters/FilterGamesByLinkedToPattern.js';

import FilterPatternsByThoseFoundInGames from './filters/FilterPatternsByThoseFoundInGames.js';
import FilterGamesByThoseWhichUsePatterns from './filters/FilterGamesByThoseWhichUsePatterns.js';

import FilterGamesToThoseWhichSharePatternsWithAGame from './filters/FilterGamesToThoseWhichSharePatternsWithAGame.js';

import FilterPatternsByThoseWithRelationToPattern from './filters/FilterPatternsByThoseWithRelationToPattern.js';
import FilterPatternsByThoseWithoutRelationToPattern from './filters/FilterPatternsByThoseWithoutRelationToPattern.js';

import FilterPatternsByThoseWithRelationToPatterns from './filters/FilterPatternsByThoseWithRelationToPatterns.js';

import FilterPatternsByContent from './filters/FilterPatternsByContent.js';

import ArrayUnion from './combiners/ArrayUnion.js';
import ArrayIntersection from './combiners/ArrayIntersection.js';
import ArrayDifference from './combiners/ArrayDifference.js';

import DataOutput from './output/DataOutput.js';
import SingularGame from './generators/SingularGame.js';
import SingularPattern from './generators/SingularPattern.js';

export default {
	list : [
		new AllPatterns,
		new AllGames,
		new SingularGame,
		new SingularPattern,
		new FilterPatternsByCategory,
		new FilterGamesByCategory,
		new FilterPatternsByLinkedToGame,
		new FilterGamesByLinkedToPattern,
		new FilterPatternsByThoseFoundInGames,
		new FilterGamesByThoseWhichUsePatterns,
		new FilterGamesToThoseWhichSharePatternsWithAGame,
		new FilterPatternsByThoseWithRelationToPattern,
		new FilterPatternsByThoseWithoutRelationToPattern,
		new FilterPatternsByThoseWithRelationToPatterns,
		new FilterPatternsByContent,
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