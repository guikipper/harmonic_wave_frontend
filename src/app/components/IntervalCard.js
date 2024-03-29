"use client";

import styles from "../styles/IntervalCard.module.css";
import { useState, useEffect, useContext } from "react";
import { useMyContext } from "../contexts/UseContext";
import Piano from "./Piano";
import { useRouter } from "next/navigation";
import { AiTwotoneSound } from "react-icons/ai";
import GameInteractionButton from "./Buttons/GameInteractionButton";
import RoundsIndicator from "./RoundsIndicator";
import { findNoteByIntervalAndStart } from "../utils/findInterval";
import { ajustarOitava, converterNota } from "../utils/noteConversor";
import { removeAccents } from "../utils/removeAccents";
import { FeedbackMessage } from "./FeedbackMessage";
import SessionResults from "./SessionResults";
//<FontAwesomeIcon icon="fa-solid fa-play" />

export default function IntervalCard() {
  const [targetNote, setTargetNote] = useState();
  const [actualInterval, setActualInterval] = useState();
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState();
  const [referenceNote, setReferenceNote] = useState();
  const [selectedIntervals, setSelectedIntervals] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [messageStyle, setMessageStyle] = useState({});
  const [buttonsToShow, setButtonsToShow] = useState([]);
  const [results, setResults] = useState([]);
  const [roundsResults, setRoundsResults] = useState([]);
  const [visibleHelp, setVisibleHelp] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [blockedButton, setBlockedButton] = useState(true);
  const [resultsRoundsIndicator, setResultRoundsIndicator] = useState([])
  const [showCurrentRound, setShowCurrentRound] = useState(true)
  const router = useRouter();
  const [audioContext, setAudioContext] = useState(null);

  const [finishedExercises, setFinishedExercises] = useState(false)
  const [notaReferenciaNoTeclado, setNotaReferenciaNoTeclado] = useState()
  const [notaAlvoNoTeclado, setNotaAlvoNoTeclado] = useState()
  const [adjustedReferenceNoteWithOctave, setAdjustedReferenceNoteWithOctave] = useState();
  const [adjustedTargetNoteWithOctave, setAdjustedTargetNoteWithOctave] = useState();
  const [showNotesOnPiano, setShowNotesOnPiano] = useState(false)
  const [isRandomNote, setIsRandomNote] = useState()

  const [initialTime, setInitialTime] = useState()
  
  const [isRightAnswer, setIsRightAnswer] = useState()
  const [totalRightAnswers, setTotalRightAnswers] = useState(0)

  const { formData } = useMyContext()

  const intervalsPerType = {
    menor: ["Segunda Menor", "Terça Menor", "Sexta Menor", "Sétima Menor"],
    maior: ["Segunda Maior", "Terça Maior", "Sexta Maior", "Sétima Maior"],
    justo: ["Uníssono", "Quarta Justa", "Quinta Justa", "Oitava Justa"],
    tritono: ["Trítono"],
  };

  const getSelectedIntervals = () => {
    if (formData.intervalOptions) {
      const selectedIntervals = Object.keys(formData.intervalOptions).
        filter((intervalo) => formData.intervalOptions[intervalo]) //Por exemplo: [maior, menor, justo, trítono] 
       
      const intervalsToShow = []

      selectedIntervals.filter((intervalo) => {
        if (formData.intervalOptions[intervalo]) {
          intervalsPerType[intervalo].filter((item) => {
            intervalsToShow.push(item)
          })
      }})
      const order = {
        "uníssono": 1, "segunda menor": 2, "segunda maior": 3, "terça menor": 4, "terça maior": 5,
        "quarta justa": 6, "trítono": 7, "quinta justa": 8, "sexta menor": 9, "sexta maior": 10,
        "sétima menor": 11, "sétima maior": 12, "oitava justa": 13
      };
  
      intervalsToShow.sort((a, b) => {
        const normalizedA = removeAccents(a);
        const normalizedB = removeAccents(b);
        return order[normalizedA] - order[normalizedB];
    });

      setButtonsToShow(intervalsToShow) 
      setSelectedIntervals(selectedIntervals)
    }
  }
    
  useEffect(() => {
    setTotalRounds(formData.rounds)
    if(formData.referenceNote === "random") {
      setIsRandomNote(true)
      const randomNote = getRandomNote()
      setReferenceNote(randomNote)
    } else {
      setReferenceNote(formData.referenceNote)
    }
    getSelectedIntervals()
  }, [formData]);

  useEffect(() => {
    continueGame(referenceNote)
  }, [selectedIntervals])

  useEffect(() => {
    if (round == 1) {
      getInitialTime()
    }
    if(round > 1) {
      if (isRandomNote) {
        const randomNote = getRandomNote()
        setReferenceNote(randomNote)
        continueGame(randomNote)
      } else {
        continueGame(referenceNote)
      }
    }
  }, [round])

  const getInitialTime = () => {
    setInitialTime(Date.now())
  }  

  const continueGame = (currentReferenceNote) => {
    const randomInterval = getRandomInterval()
    
    if (randomInterval) {
      const formatedRandomInterval = removeAccents(randomInterval)
      
      setActualInterval(formatedRandomInterval)
      const targetNote = findNoteByIntervalAndStart(currentReferenceNote, formatedRandomInterval)
      setTargetNote(targetNote)
      const formatedReferenceNote = converterNota(currentReferenceNote)
      const formatedTargetNote = converterNota(targetNote)
      const [adjustedReferenceNote, adjustedTargetNote] = ajustarOitava(formatedReferenceNote, formatedTargetNote, formatedRandomInterval)
      setAdjustedReferenceNoteWithOctave(adjustedReferenceNote)
      setAdjustedTargetNoteWithOctave(adjustedTargetNote)
    } 
  }

  const getRandomNote = () => {
    const notes = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']
    const randomIndex = Math.floor(Math.random() * notes.length)
    return notes[randomIndex]
  }

  const getRandomInterval = () => {
    const randomIndex = Math.floor(Math.random() * buttonsToShow.length)
    return buttonsToShow[randomIndex]
  }

    const play = async (audio) => {
      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
        const response = await fetch(audio);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          source.disconnect();
        };
        source.start();
      } catch (error) {
        console.error("Error with playing audio", error);
      }
    };
  
    const reproduceActualInterval = () => {
      if (formData.direction == "ascendente") {
        const audioFile = `/audio/electric_piano_1-mp3/${adjustedReferenceNoteWithOctave}.mp3`;
  
        play(audioFile);
        const audioFile2 = `/audio/electric_piano_1-mp3/${adjustedTargetNoteWithOctave}.mp3`;

        setTimeout(() => {
          play(audioFile2);
          setTimeout(() => {
            if (!showContinueButton) {
              setBlockedButton(false);
            }
          }, 500)
          
        }, 1800);
      } else {
        const audioFile = `/audio/electric_piano_1-mp3/${adjustedTargetNoteWithOctave}.mp3`;
        play(audioFile);
        const audioFile2 = `/audio/electric_piano_1-mp3/${adjustedReferenceNoteWithOctave}.mp3`;
        setTimeout(() => {
          play(audioFile2);
          setTimeout(() => {
            if (!showContinueButton) {
              setBlockedButton(false);
            }
          }, 500)
        }, 1800);
      }
    };

  //Audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudioContext(new AudioContext());
    }
  }, []);

  const intervals = [
    "1J",
    "2m",
    "2M",
    "3m",
    "3M",
    "4J",
    "4A/5D",
    "5J",
    "6m/5A",
    "6M",
    "7m",
    "7M",
    "8J",
  ];

  /* const isObjectEmpty = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  };
  if (isObjectEmpty(formData)) {
    //router.push('../intervals/exercise-config');
  } */
  

  const checkResult = (selectedOption) => {
    if (selectedOption === 'tritono') {
      selectedOption = 'Quinta Diminuta'
    }
    setShowNotesOnPiano(true)
    setNotaReferenciaNoTeclado(referenceNote)
    setNotaAlvoNoTeclado(targetNote)

    const selectedOptionsFormated = removeAccents(selectedOption)
    const actualIntervalFormated = removeAccents(actualInterval)

    setBlockedButton(true);
    setShowCurrentRound(false); //revisar

   if (selectedOptionsFormated == actualIntervalFormated) {
    setTotalRightAnswers(prevTotalRightAnswers => prevTotalRightAnswers + 1);
      setIsRightAnswer(true) 
      optionFeedback("green");
      saveRoundsData(round, true, actualInterval, selectedOption);
      setShowContinueButton(true);
      setResultRoundsIndicator((prevArray) => [...prevArray, true])
    } else {
      setIsRightAnswer(false)
      optionFeedback("red");
      setShowContinueButton(true);
      saveRoundsData(round, false, actualInterval, selectedOption);
      setResultRoundsIndicator((prevArray) => [...prevArray, false])
    }
  };

  const optionFeedback = (messageColor) => {
    setMessageStyle({
      color: messageColor,
    });
    setShowFeedback(true);
  };

  const saveRoundsData = (round, rightAnswer, actualInterval, selectedOption) => {
    const roundResult = {
      round: round,
      rightAnswer: rightAnswer,
      actualInterval: actualInterval,
      selectedOption: selectedOption,
    };
    setRoundsResults((prevArray) => [...prevArray, roundResult]);
  };

  const handleHelp = () => {
    setVisibleHelp(!visibleHelp);
  };

  const attRound = () => {
    if (formData.round != round) {
      setRound((prevRound) => prevRound + 1);
    }
  };

  const continueToNextRound = () => {
    setShowFeedback(false)
    setShowNotesOnPiano(false)
    setShowContinueButton(false)
    setShowCurrentRound(true);
    attRound();
    if (formData.rounds === round) {
      handleFinishSession()
    }
  };

  const handleFinishSession = () => {
    const finishTime = Date.now()
    const timeInMiliseconds = finishTime - initialTime
    const timeInseconds = Math.floor(timeInMiliseconds / 1000)
    const results = {
      sessionData: {
      date: Date.now(),
      timeInSeconds: timeInseconds,
      timeInMiliseconds: timeInMiliseconds,
      totalRightAnswers: totalRightAnswers
      },
      rounds: roundsResults
    }
    setResults(results);
    setFinishedExercises(true)
  }

  useEffect(() => {
    if (finishedExercises) {
      //handleSaveData()
    }
  }, [finishedExercises])

  return (
      <div className={styles.main}>
        <div className={styles.card}>
          {formData.rounds + 1 === round ? (
            <div>
              <SessionResults
              results={results}
              />
            </div>
          ) : (
            <>
              {/* <div className={styles.help} onClick={handleHelp}>
                <p>?</p>
              </div> */}

              <div className={styles.roundsIndicatorSizeControl}>
                <RoundsIndicator rounds={formData.rounds} results={resultsRoundsIndicator} showCurrentRound={showCurrentRound}></RoundsIndicator>
              </div>
              

              <div className={styles.reproduceIntervalAndContinue}>

                  <div className={`${styles.item} ${styles.main_item}`}>
                    <p>Reproduzir Intervalo Atual</p>
                    <div
                      className={styles.reproduceInterval}
                      onClick={reproduceActualInterval}
                    >
                      <AiTwotoneSound className={styles.reproduceIntervalIcon}/>
                    </div>
                  </div>
                  
                  <div className={styles.item}
                    onClick={() => {
                      continueToNextRound();
                    }}>
                      {showContinueButton && (
                        <GameInteractionButton>
                          Próximo
                        </GameInteractionButton>
                      )}
                  </div>
                  
                  
                  <div className={`${styles.item} ${styles.feedbackMessageDiv}`}>
                    <FeedbackMessage isRightAnswer={isRightAnswer} showFeedback={showFeedback} actualInterval={actualInterval}></FeedbackMessage>
                  </div>
                

              </div>
                
               
              {/* Menu */}

              <div className={styles.responseButtonsDiv}>
                { buttonsToShow.map((intervalToShow, index) => (
                        <button
                        className={`${styles.responseButtons} ${blockedButton ? styles.responseButtonsBlocked : ''}`}
                        key={index}
                        disabled={blockedButton}
                        onClick={() => {
                          checkResult(intervalToShow);
                        }}
                      >
                        {intervalToShow}
                      </button>
                  ))
                }
              </div>
            </>
          )}
        </div>

       {/*  {visibleHelp && <IntervalsTable />} */}
        
        <div className={styles.pianoDiv}>
          <Piano 
          notaReferencia={notaReferenciaNoTeclado} 
          notaAlvo={notaAlvoNoTeclado} 
          adjustedReferenceNoteWithOctave={adjustedReferenceNoteWithOctave} 
          adjustedTargetNoteWithOctave={adjustedTargetNoteWithOctave}
          showNotesOnPiano={showNotesOnPiano}/>
        </div> 
        
      </div>
  );
}
