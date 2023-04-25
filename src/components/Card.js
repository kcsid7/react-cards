import React, {useState} from "react";

import "./Card.css"

function Card({image, suit, value}) {

    // Sets a random orientation for the cards
    const [cardPos, setCardPos] = useState({
        x: Math.random() * 100 - (Math.random() * 70),
        y: Math.random() * 100 - (Math.random() * 50),
        rot: Math.random() * 120 - (Math.random() * 45)
    })

    const cardStyle = `translate(${cardPos.x}px, ${cardPos.y}px) rotate(${cardPos.rot}deg)`

    return <img 
                className="Card" 
                src={`${image}`}
                style={{transform: cardStyle}}
                alt={`${value}-${suit}`}

            />
} // Card End

export default Card;
