"use client";

import styles from "../styles/ExerciseConfig.module.css";
import { useMyContext } from "../contexts/UseContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { notes } from "../utils/notes";

export default function ExerciseConfig() {

  const router = useRouter();
  const [direction, setDirection] = useState("ascendente");
  const [referenceNote, setReferenceNote] = useState('random');
  const [rounds, setRounds] = useState(0)
  const [dropdownItem, setDropdownItem] = useState("Aleatório")
  const [tryAgain, setTryAgain] = useState(false) 
  const [roundsMessage, setRoundsMessage] = useState(false)
  const [intervalOptions, setIntervalOptions] = useState({
    maior: false,
    menor: false,
    justo: false,
    tritono: false,
  });
  const [intervalOptionsMessage, setIntervalOptionsMessage] = useState(false)
  
  const { setFormData } = useMyContext()

  const handleToogleTryAgain = () => {
    setTryAgain(!tryAgain)
  }

  const handleDropdownItemSelected = (note) => {

    if (note == 'random') {
      setDropdownItem('Aleatório')
      setReferenceNote(note)
    } else {
      setDropdownItem(note)
      setReferenceNote(note)
      }
  }

  const handleOptionChange = (event) => {
    setDirection(event.target.value);
  };

  const incrementCont = (qtd) => {
    setRounds((prevRound) => prevRound + qtd )
  }

  const decrementCont = (qtd) => {
    if (rounds != 0) {
      setRounds((prevRound) => prevRound - qtd )
    }
  }

  const hasSelectedInterval = () => {
    const { maior, menor, justo, tritono } = intervalOptions
    return maior || menor || justo || tritono
  }
  

  const sendParams = () => {
    if (rounds <= 0 || !hasSelectedInterval()) {
      if (rounds <= 0) {
        setRoundsMessage(true)
        setTimeout(()=>{
          setRoundsMessage(false)
        }, 3000)
      }
      if (!hasSelectedInterval()) {
        setIntervalOptionsMessage(true)
        setTimeout(()=>{
          setIntervalOptionsMessage(false)
        }, 3000)
      }      
    } else {
      setFormData({
        referenceNote: referenceNote,
        direction: direction,
        intervalOptions,
        tryAgain,
        rounds: rounds,
      });
      router.push('/intervals/exercise');
    }
  }

  return (
    <div className={styles.config}>
      <div className={styles.column}>
        <div className={styles.dropOp}>
          <p className={styles.text}>Selecione a nota de referência:</p>

          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {dropdownItem}
            </button>
            
            <ul className={`dropdown-menu ${styles.auxiliarDropdown}`}>
              {notes.map((note, index) => {
                return (
                <li key={index}>
                  <a className="dropdown-item" onClick={() => {
                    handleDropdownItemSelected(note)
                  }}>
                    {note}
                  </a>
                </li>)
              })} 
            </ul>

          </div>
        </div>

        <div className={styles.direction}>
          <p className={styles.text}>Escolha a direção dos intervalos:</p>
          <form>
            <label>
              <input
                type="radio"
                name="ascendente"
                value="ascendente"
                checked={direction === "ascendente"}
                onChange={handleOptionChange}
              />
              Ascendente
            </label>

            <label>
              <input
                type="radio"
                name="descendente"
                value="descendente"
                checked={direction === "descendente"}
                onChange={handleOptionChange}
              />
              Descendente
            </label>
          </form>
        </div>

        <div className={styles.intervalOptions}>
          <p className={styles.text}>Selecione os invervalos que você deseja treinar:</p>
          <div className={styles.checkbox}>
            <label>
              <input
                type="checkbox"
                name="maior"
                value="maior"
                checked={intervalOptions.maior}
                onChange={() =>
                  setIntervalOptions({
                    ...intervalOptions,
                    maior: !intervalOptions.maior,
                  })
                }
              />
              Maior
            </label>

            <label>
              <input
                type="checkbox"
                name="menor"
                value="menor"
                checked={intervalOptions.menor}
                onChange={() =>
                  setIntervalOptions({
                    ...intervalOptions,
                    menor: !intervalOptions.menor,
                  })
                }
              />
              Menor
            </label>

            <label>
              <input
                type="checkbox"
                name="justo"
                value="justo"
                checked={intervalOptions.justo}
                onChange={() =>
                  setIntervalOptions({
                    ...intervalOptions,
                    justo: !intervalOptions.justo,
                  })
                }
              />
              Justo
            </label>

            <label>
              <input
                type="checkbox"
                name="tritono"
                value="tritono"
                checked={intervalOptions.tritono}
                onChange={() =>
                  setIntervalOptions({
                    ...intervalOptions,
                    tritono: !intervalOptions.tritono,
                  })
                }
              />
              Trítono
            </label>
          </div>
          {intervalOptionsMessage && (
            <p className={styles.intervalOptionsMessage}>Informe ao menos um intervalo.</p>
          )}
          
        </div>

        {/* <div className={styles.tryAgain}>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="flexSwitchCheckDefault"
              checked={tryAgain}
              onChange={handleToogleTryAgain}
            />

            <label
              className="form-check-label"
              htmlFor="flexSwitchCheckDefault"
            >
              Tentar de novo ao errar
            </label>
          </div>
        </div> */}

        <div className={styles.roundQtd}>
          <p className={styles.text}>Informe quantas rodadas você gostaria de praticar:</p>
          <p>Rodadas: {rounds}</p>
          <div className={styles.roundQtdBtn}>
            
            <button type="button" className="btn btn-danger"
            disabled={rounds <= 0}
            onClick={() => {decrementCont(1)}}>
              -1
            </button>
            <button type="button" className="btn btn-danger"
            disabled={rounds <= 4}
            onClick={() => {
              if(rounds >= 5) {
                decrementCont(5)
              }
              }}>
              -5
            </button>
            <button 
            disabled={rounds >= 30}
            type="button" 
            className="btn btn-success" 
            onClick={() => {incrementCont(1)}}>
              +1
            </button>
            <button 
            disabled={rounds >= 26}
            type="button" className="btn btn-success"
            onClick={() => {incrementCont(5)}}>
              +5
            </button>
            {roundsMessage && (
                <p className={styles.roundMessage}>Selecione um valor válido.</p>
            )}
          </div>
        </div>

        <div className={styles.confirmBtn}>
        
        <button type="button" className="btn btn-primary" onClick={sendParams}>
            Começar treino!
        </button>

        </div>
        
      </div>
    </div>
  );
}
