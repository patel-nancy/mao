import React, { useEffect, useState } from 'react';
//import { useAuth } from "../AuthContext";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import BackBtn from '../components/BackBtn';
import Spinner from '../components/Spinner';
import { socket } from '../socket';

//TODO: get rid of user from player's list if they close off the tab...ie, don't actually press the back btn
//NOTE: "list all users in room" will happen during gameplay where you can see the person you're competing against

//TODO: implement passwords
//TODO: set Start based on room.started -- DONE?

const enterRoom = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const user = localStorage.getItem('username');
  //session user
  if (!user) {
    navigate('/');
  }

  const [room, setRoom] = useState({});
  const { id } = useParams(); //from the APP route parameters: /rooms/enter/:id (NOTE: it has to be the same variable name as what's used in the Route)

  const [starting, setStarting] = useState(false);
  const [cards, setCards] = useState([]);
  const [playedCard, setPlayedCard] = useState([]);
  const [otherCards, setOtherCards] = useState([{}]);
  const [deck_id, setDeckId] = useState();
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //update room's players list (CHECKS: password, room.started)
    axios
      .put(`http://localhost:5555/rooms/adduser/${id}`, { newplayer: user }, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.data.success) {
          //update player's curr_room_id to entered room
          axios
            .put(`http://localhost:5555/users/curr_room/${user}`, { room_id: id }, { headers: { 'Content-Type': 'application/json' } })
            .then((res2) => {
              if (res2.data.success) {
                console.log("Success. Room's player list and user's curr_room_id updated.");

                //socket join room
                socket.emit('join-room', { room_id: id });

                //send to all other players new player list
                socket.emit('update-player-list', {
                  room_id: id
                });

                fetchRoomByID();
              } else {
                console.log(res2.data.message);
              }
            })
            .catch((err2) => {
              console.log("An internal server error occured. Could not update player's curr_room_id");
            });
        } else {
          //could not add player to room
          console.log(res.data.message);
          navigate('/home');
        }
      })
      .catch((err) => {
        console.log("An internal server error occured. Could not update room's player list");
      });

    //updating player list
    socket.on('updating-player-list', () => {
      fetchRoomByID();
    });

    //updating to show your cards
    socket.on('updating-cards', ({ deck_id }) => {
      console.log('From updating-cards socket', deck_id);
      yourCards(deck_id);
      getPlayedCard(deck_id);
    });

    //updating to starting/stopping
    socket.on('game_starting', ({ deck_id }) => {
      console.log('Updating start button to stop.');
      setStarting(true);
      setDeckId(deck_id);
    });
    socket.on('game_stopping', () => {
      console.log('Updating stop button to start.');
      setStarting(false);
    });
    socket.on('game_over', ({ playerWhoWon }) => {
      //TODO: make sure stats are only updated once
      console.log('Won: ', playerWhoWon);

      //set room.started back to false
      handleStarting(false);

      let isWin;
      if (playerWhoWon === user) {
        isWin = true;
      } else {
        isWin = false;
        console.log('You lost');
      }

      //update player stats
      axios
        .post(
          'http://localhost:5555/users/updateStats',
          { username: user, isWin: isWin },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then((res) => {
          if (res.data.success) {
            console.log('Player win stats updated');
          } else {
            console.log(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err.message);
        });

      socket.off('game_over');

      setGameOver(true);
      setWinner(playerWhoWon);
    });
  }, []);

  window.addEventListener('beforeunload', function (e) {
    const leaveMessage = 'Leave site? Changes you made may not be saved.';
    console.log(id);
    e.returnValue = leaveMessage;

    return leaveMessage;
  });

  function deleteUserOnUnload() {
    console.log('Deleting user on unload');
    socket.emit('delete_user_on_disconnect', { user: user, room_id: id });
    handleStarting(false);
  }

  window.addEventListener('unload', deleteUserOnUnload);

  const fetchRoomByID = async () => {
    //getting room again
    try {
      axios
        .get(`http://localhost:5555/rooms/${id}`)
        .then((res) => {
          setRoom(res.data);
        })
        .catch((err) => {
          console.log(err);
          // setLoading(false);
        });
    } catch (err) {
      console.error('Error fetching room: ', err.message);
    }
  };

  const handleStarting = async (req) => {
    //useState makes this render super slowly (to the point where starting is not registered as = req), so I made it a variable
    setStarting(req);
    console.log('Req', req, 'starting', starting);

    axios
      .post(`http://localhost:5555/rooms/started/${id}`, { shouldstart: req }, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.data.success && req) {
          console.log('Game starting...');
          createGame();
          //socket.emit("game_starting", { room_id: id});
        } else if (res.data.success && !req) {
          console.log('Game stopping...');
          setCards([]);
          setOtherCards([]);
          setDeckId();
          socket.emit('game_stopping', { room_id: id });
        } else {
          console.log(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const createGame = async () => {
    axios
      .post('http://localhost:5555/cards/startgame', { room_id: id }, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.data.success) {
          socket.emit('game_starting', {
            room_id: id,
            deck_id: res.data.deck_id
          });
          setDeckId(res.data.deck_id);

          //creating rules for the game
          //should only do something if X goes wrong
          axios
            .post('http://localhost:5555/games/generate_rules', { room_id: id }, { headers: { 'Content-Type': 'application/json' } })
            .then((res2) => {
              if (res2.data.success) {
                console.log('Room rules updated');
              } else {
                console.log(res2.data.message);
              }
            })
            .catch((err2) => {
              console.log(err2.message);
            });

          //get your + other cards
          console.log('Sent socket to update/show cards');
          socket.emit('update-cards', {
            room_id: id,
            deck_id: res.data.deck_id
          });
        } else {
          console.log(res.data.message);
        }
      })
      .catch((err) => console.log(err.message));
  };

  //maybe we can do yourCards and otherCards together
  const yourCards = async (req_deck_id) => {
    axios
      .post(
        'http://localhost:5555/cards/whosecards',
        { deck_id: req_deck_id, username: user },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        if (res.data.success) {
          console.log('Getting your cards...');
          setCards(res.data.cards);

          if (res.data.remaining === 0) {
            console.log('You win!');

            //emit a socket to everyone...room_id and user who won
            socket.emit('game_over', {
              room_id: id,
              playerWhoWon: user
            });
          }

          let list_pile = res.data.list_pile;
          let otherCardsArray = new Array();
          //go through each of the other players in res.data.list_pile
          //get how many cards they have backwards
          for (let player in list_pile) {
            if (player !== user && player !== 'played') {
              let otherRemaining = list_pile[player].remaining;
              console.log(player + ' has ' + otherRemaining + 'cards remaining');

              let remainingJson = { player: player, remaining: otherRemaining };
              otherCardsArray.push(remainingJson);
            }
          }

          setOtherCards(otherCardsArray);
        } else {
          console.log(res.data.message);
        }
      })
      .catch((err) => {
        console.log('An internal server error occured.');
      });
  };

  const getPlayedCard = async (req_deck_id) => {
    axios
      .post(
        'http://localhost:5555/cards/whosecards',
        { deck_id: req_deck_id, username: 'played' },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        if (res.data.success) {
          console.log('Getting played card...');
          console.log(res.data.top_card);
          setPlayedCard(res.data.top_card);
        } else {
          console.log(res.data.message);
        }
      })
      .catch((err) => {
        console.log('An internal server error occured.');
      });
  };

  const handleDraw = async () => {
    //is it your turn? (if not, then you can't draw cards)
    const result = await axios.post(
      'http://localhost:5555/games/isMyTurn',
      { deck_id: deck_id, username: user, room_id: id },
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (!result) {
      console.log('Unable to check if its your turn');
    } else {
      if (result.data.success && result.data.isMyTurn) {
        //draw from deck...send to players pile
        axios
          .post(
            'http://localhost:5555/cards/sendcards',
            { deck_id: deck_id, playertosend: user },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .then((res) => {
            if (res.data.success) {
              console.log('Drawing card...');

              //update to next players turn
              axios
                .post(
                  'http://localhost:5555/games/updateTurn',
                  { room_id: id, card_code: 'LL' },
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                )
                .then((res2) => {
                  if (res2.data.success) {
                    console.log('Player index updated');
                  } else {
                    console.log(res2.data.message);
                  }
                })
                .catch((err2) => {
                  console.log(err2.message);
                });

              //update your hand
              yourCards(deck_id);
              socket.emit('update-cards', { room_id: id, deck_id: deck_id });
            } else {
              console.log(res.data.message);
            }
          })
          .catch((err) => {
            console.log(err.message);
          });
      } else if (!result.data.success) {
        console.log(result.data.message);
      } else {
        console.log('It is not your turn. Cannot draw cards');
      }
    }
  };

  const handlePlay = async (card_code) => {
    //console.log(card_code);
    console.log('From handlePlay: ', card_code);
    console.log(deck_id, id);

    axios
      .post(
        'http://localhost:5555/games/playTurn',
        {
          card_code: card_code,
          deck_id: deck_id,
          username: user,
          room_id: id
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        if (!res.data.success) {
          //failed
          console.log(res.data.message);
        } else {
          //turn succeeded...see if cards were drawn or played
          if (res.data.isPlayedChanged) {
            //update playedCard
            getPlayedCard(deck_id);

            //upodate your hand
            yourCards(deck_id);

            //send a socket to everyone
            socket.emit('update-cards', {
              room_id: id,
              deck_id: deck_id
            });
          } else {
            //cards were drawn...update user hand
            yourCards(deck_id);
            socket.emit('update-cards', {
              room_id: id,
              deck_id: deck_id
            });
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div className='p-4'>
      <BackBtn />
      <h1 className='text-3xl my-4'>Enter Room</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4'>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>Id</span>
            <span>{room._id}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>Owner</span>
            <span>{room.owner}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>Players</span>
            <span>{room.players}</span>
          </div>
        </div>
      )}
      {gameOver ? (
        <div>
          <h1 className='text-3xl my-4'>Game Over. {winner} won.</h1>
        </div>
      ) : (
        <div>
          {starting ? (
            <div>
              <button onClick={() => handleStarting(false)} className='text-3xl my-4'>
                Stop
              </button>
              <h1>Your Cards</h1>
              <div className='flex flex-row flex-wrap'>
                {cards.map((card) => (
                  <img src={card.image} alt='' key={card.code} onClick={() => handlePlay(card.code)} className='cursor-pointer w-20' />
                ))}
              </div>

              <h1>Played Cards</h1>
              <div className='flex flex-row w-20'>
                <img src={playedCard.image} alt='' key={playedCard.code} />
              </div>

              <h1>Other Players</h1>
              <div className='flex flex-col'>
                {otherCards.map((playerJson, index) => (
                  <>
                    <h1>{playerJson.player}</h1>
                    <div className='flex flex-row w-20'>
                      {Array.from({ length: playerJson.remaining }).map((t, i) => (
                        <img
                          key={i}
                          src='https://www.deckofcardsapi.com/static/img/back.png' // Replace with your actual image source
                          alt={`Card ${i + 1}`}
                          style={{ width: '50px', height: '75px', marginRight: '5px' }} // Adjust the size as needed
                        />
                      ))}
                    </div>
                  </>
                ))}
              </div>

              <h1>Draw Pile</h1>
              <div className='flex flex-row w-20'>
                <img
                  src='https://www.deckofcardsapi.com/static/img/back.png'
                  alt=''
                  onClick={() => handleDraw()}
                  className='cursor-pointer'
                  key='draw_card'
                />
              </div>
            </div>
          ) : (
            <button onClick={() => handleStarting(true)} className='text-3xl my-4'>
              Start Game
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default enterRoom;
