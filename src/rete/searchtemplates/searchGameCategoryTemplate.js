export default function searchGameCategoryTemplate(gameCategoryName){
	return({
  "id": "tasksample@0.1.0",
  "nodes": {
    "3": {
      "id": 3,
      "data": {},
      "inputs": {
        "patternsInput": {
          "connections": [
            {
              "node": 10,
              "output": "games",
              "data": {}
            }
          ]
        }
      },
      "outputs": {},
      "position": [
        773.0704629934341,
        255.59383979313162
      ],
      "name": "Output Data"
    },
    "9": {
      "id": 9,
      "data": {},
      "inputs": {},
      "outputs": {
        "games": {
          "connections": [
            {
              "node": 10,
              "input": "gamesInput",
              "data": {}
            }
          ]
        }
      },
      "position": [
        55.776973507621776,
        304.6674141331168
      ],
      "name": "All Games"
    },
    "10": {
      "id": 10,
      "data": {
        "GameCategory": {
          "value": gameCategoryName,
          "label": gameCategoryName
        }
      },
      "inputs": {
        "gamesInput": {
          "connections": [
            {
              "node": 9,
              "output": "games",
              "data": {}
            }
          ]
        }
      },
      "outputs": {
        "games": {
          "connections": [
            {
              "node": 3,
              "input": "patternsInput",
              "data": {}
            }
          ]
        }
      },
      "position": [
        393.99213903754844,
        299.66952413054304
      ],
      "name": "Filter Games by Category"
    }
  }
});
}