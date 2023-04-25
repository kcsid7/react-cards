import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import Card from "./Card.js";

import "./Deck.css"

function Deck() {

    const API_URL = `http://deckofcardsapi.com/api/deck`

    const [deck, setDeck] = useState({}); // Holds Deck ID and Remaining Cards Info
    const [cards, setCards] = useState([]); // Holds the card information [{suit, value, image}, ... ]
    const [auto, setAuto] = useState(false); // Used to determine if drawing every second is triggered
    
    let timerId = useRef(null); // Used for the interval ID when drawing a card every second

    // Initial API Call to setup the deck ID
    useEffect( () => {
        getDeckData();
    }, []) //end

    // Async function that requests the deck data from the API
    async function getDeckData(numDecks=1) {
        const newDeck = await axios.get(`${API_URL}/new/shuffle/?deck_count=${numDecks}`)
        setDeck(() => ({
            deckId: newDeck.data.deck_id,
            remaining: newDeck.data.remaining
        }))
    } //end

    // Draws cards from a given deck
    // Arguments (DeckId, Number of Cards to Draw = default(1))
    // Returns the Card Data
    async function getCards(id, count=1) {
        const newCards = await axios.get(`${API_URL}/${id}/draw/?count=${count}`)

        // Updates the remaining count in the deck state obj
        setDeck( d => {
            return {
                ...d,
                remaining: newCards.data.remaining
            }
        })

        // Takes the card info and returns only the required information (suit, value, image, code)
        return newCards.data.cards.map( c => ({
            suit : c.suit,
            value : c.value,
            code : c.code,
            image : c.image
        }))
    } //end

    // Triggered when "Draw One" button is pressed
    // Requests one card from the deck
    // The new card is added to the cards state
    async function drawOneButton() {
        const drawnCard = await getCards(deck.deckId);
        setCards( cards => [...cards, ...drawnCard])    
    } //end


    // Triggered when "Draw Every Second" button is pressed
    // Requests one card from the deck every second
    function drawEverySecond() {
        // timerId ref is used to hold the interval ID to remove it later on
        timerId.current = setInterval(() => {
            async function drawCards() {
                const drawnCard = await getCards(deck.deckId);
                setCards( cards => [...cards, ...drawnCard])  
            }
            drawCards();
        }, 1000)
        // Updates the auto state which is used to toggle between different buttons
        setAuto(true);

        // If there are no more cards left to draw then we clear the interval
        if (deck.remaining === 0) clearInterval(timerId.current);
    } //end

    // Triggered when "Stop Drawing" button is pressed
    // The "Stop Drawing" button is only shown when the auto state is true
    // Used to remove the interval and set auto draw to false
    function clearAutoDraw() {
        clearInterval(timerId.current); 
        setAuto(false);
    } //end


    // Triggered when "Draw New Deck" button is pressed
    // The "Draw New Deck" button is only shown if the cards remaining is 0
    function drawNewDeck() {
        setCards([]); // Removes all the current cards 
        clearAutoDraw(); // Removes auto draw interval ID and sets auto to false
        getDeckData();  // Populates the deck state with new deck data
    } //end

    const cardsHTML = cards.map( c => <Card key={c.code} image={c.image} suit={c.suit} value={c.value}/>)

    return (
        <div className="Deck">
            <div>
                <h1 className="Deck-Remaining">
                    {deck.remaining} {`${deck.remaining === 1 ? "Card" : "Cards"}`} Left 
                <button className="Draw-Shuffle-Button" onClick={drawNewDeck}>Shuffle</button>
                </h1>
            </div>
            
            <div className="Deck-Out-Of-Cards" hidden={deck.remaining !== 0}>
                <button className="Draw-Button" onClick={drawNewDeck}>Draw New Deck</button>
            </div>

            <div className="Deck-Button-Group" hidden={deck.remaining === 0}>
                <button className="Draw-Button" onClick={drawOneButton} hidden={auto}>Draw One</button>
                {
                    auto ? 
                    <button className="Draw-Button" onClick={clearAutoDraw}>Stop Drawing</button> :
                    <button className="Draw-Button" onClick={drawEverySecond}>Draw Every Second</button> 
                }
            </div>
     
            <div className="Deck-Cards">
                {cardsHTML}
            </div>
        </div>
    ) //end
} //Deck End

export default Deck;