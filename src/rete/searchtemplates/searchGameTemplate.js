export default function searchGameTemplate(gameName){
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
              "node": 13,
              "output": "patterns",
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
    "13": {
      "id": 13,
      "data": {
        "Game": {
          "value": gameName,
          "label": gameName
        }
      },
      "inputs": {
        "patternsInput": {
          "connections": [
            {
              "node": 14,
              "output": "patterns",
              "data": {}
            }
          ]
        }
      },
      "outputs": {
        "patterns": {
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
        326.88925282566436,
        265.7768574329448
      ],
      "name": "Filter Patterns to Those Linked To A Game"
    },
    "14": {
      "id": 14,
      "data": {},
      "inputs": {},
      "outputs": {
        "patterns": {
          "connections": [
            {
              "node": 13,
              "input": "patternsInput",
              "data": {}
            }
          ]
        }
      },
      "position": [
        60.22266546552005,
        320.2248542208691
      ],
      "name": "All Patterns"
    }
  }
});
}