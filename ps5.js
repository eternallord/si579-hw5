/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 * 
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
    // You'll need to finish this...
    savedWordsArray.push(word);
    savedWords.innerHTML = savedWordsArray.join(', ');
}

savedWords.innerHTML = '(none)';

function generatesavedbtn(word){
    btn = document.createElement("button");
    btn.classList.add("btn", "btn-outline-success");
    btn.innerHTML = "(Save)";
    btn.addEventListener("click", () => addToSavedWords(word));
    return btn;
}

// Add additional functions/callbacks here.
function showRhymes(data) {
    if (data.length == 0) {
        wordOutput.innerHTML = `(no results)`;
    } 
    else {
        data = groupBy(data, 'numSyllables');
        // console.log(data);
        outputs = document.createElement('div');
        for (syllable in data) {
            syllable_tag = document.createElement('h3');
            syllable_ele = document.createElement('ul');

            syllable_tag.innerHTML = `Syllables: ${syllable}`;
            outputs.appendChild(syllable_tag);

            for (returnval in data[syllable]) {
                element = document.createElement('li');
                word = data[syllable][returnval].word;
                element.innerHTML = word + ` `;
                btn = generatesavedbtn(word);
                element.appendChild(btn);
                syllable_ele.appendChild(element);
            }
            outputs.appendChild(syllable_ele);
        }
        wordOutput.innerHTML = `<h2>Words that rhyme with ${wordInput.value}<h2>`;
        wordOutput.appendChild(outputs);
    }
}

function showSynonyms(data){
    if (data.length == 0) {
        wordOutput.innerHTML = `(no results)`;
    }
    else{
        outputs = document.createElement('ul');
        for (returnval in data){
            element = document.createElement('li');
            word = data[returnval].word;
            element.innerHTML = word + ` `;
            btn = generatesavedbtn(word);
            element.appendChild(btn);
            outputs.appendChild(element);
        }
        wordOutput.innerHTML = `<h2>Words with a similar meaning to ${wordInput.value}<h2>`;
        wordOutput.appendChild(outputs);
    }
}

// Add event listeners here.
showRhymesButton.addEventListener('click', () => {
    wordOutput.innerHTML = '<h2>...loading<h2>';
    datamuseRequest(getDatamuseRhymeUrl(wordInput.value), showRhymes);
})

wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        wordOutput.innerHTML = '<h2>...loading<h2>';
        datamuseRequest(getDatamuseRhymeUrl(wordInput.value), showRhymes);
    }
})

showSynonymsButton.addEventListener('click', () => {
    wordOutput.innerHTML = '<h2>...loading<h2>';
    datamuseRequest(getDatamuseSimilarToUrl(wordInput.value), showSynonyms);
})
