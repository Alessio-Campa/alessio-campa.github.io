import "./InventoryScreen.css"
import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons/faTrash";
import {faCoins} from "@fortawesome/free-solid-svg-icons/faCoins";

interface WalletItemProps {
  value: number
  type: string
  onChange: (value: number) => void
}

const WalletItem = ({value: initVal, type, onChange: handleChange}: WalletItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(initVal.toString())

  const handleUpdate = () => {
    const numValue = Number.parseInt(value)
    console.log(numValue)
    handleChange(isNaN(numValue) ? 0 : numValue)
    setValue(isNaN(numValue) ? "0" : numValue.toString())
    setIsEditing(false)
  }

  return (
    <div className="wallet-item">
      {
        isEditing ?
          <input
            type="number"
            autoFocus={true}
            value={value}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleUpdate()
              }
            }}
            onChange={(event) => {
              setValue(event.target.value)
            }}
            onBlur={handleUpdate}
          />
          :
          <p
            className="wallet-item-value"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            {value}
          </p>
      }
      <h4 className="wallet-item-type"> {type}</h4>
    </div>
  )
}

interface InventoryItemProps {
  value: Item;
  onDelete: () => void;
  onSell: () => void;
}

const InventoryItem = ({value: item, onDelete: handleDelete, onSell: handleSell}: InventoryItemProps) => {
  return (
    <div className="inventory-item">
      <div className="inventory-item-buttons">
        <button
          className={"delete-button"}
          style={{backgroundColor: "red"}}
          onClick={handleDelete}
        >
          <FontAwesomeIcon icon={faTrash}/>
        </button>
        <button
          className={"sell-button"}
          style={{backgroundColor: "green"}}
          onClick={handleSell}
        >
          <FontAwesomeIcon icon={faCoins}/>
        </button>
      </div>
      <h3>{item.name}</h3>
      <p>Value: {item.value} {item.value_piece}</p>
      <p>Weight: {item.weight}</p>
      <p><i> {item.description} </i></p>
    </div>
  )
}

interface InventoryItemCreateProps {
  onConfirm: (item: Item) => void
}

const InventoryItemCreate = ({onConfirm}: InventoryItemCreateProps) => {
  const [item, setItem] = useState<Item>({
    name: "",
    value: 0,
    value_piece: "GP",
    weight: 0,
    description: "",
  })

  return (
    <div className="inventory-item-create">
      <table style={{width: '100%'}}>
        <tbody>
        <tr>
          <td>Name:</td>
          <td><input value={item.name} onChange={(event) => setItem({...item, name: event.target.value})}/></td>
        </tr>
        <tr>
          <td>Value:</td>
          <td>
            <input
              value={item.value}
              type={"number"}
              onChange={(event) => setItem({...item, value: Number.parseInt(event.target.value)})}
            />
          </td>
          <td>
            <select value={item.value_piece} onChange={(event) => setItem({...item, value_piece: event.target.value})}>
              <option value="CP">CP</option>
              <option value="SP">SP</option>
              <option value="EP">EP</option>
              <option value="GP">GP</option>
              <option value="PP">PP</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Weight:</td>
          <td>
            <input
              value={item.weight}
              type={"number"}
              onChange={(event) => setItem({...item, weight: Number.parseFloat(event.target.value)})}
            />
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <textarea
              defaultValue={"Description"}
              style={{width: "100%", height: "6rem", resize: "vertical"}}
              onChange={(event) => setItem({...item, description: event.target.value})}
            >
            </textarea>
          </td>
        </tr>
        </tbody>
      </table>

      <div>
        <button onClick={() => onConfirm(item)}> Create</button>
      </div>
    </div>
  )
}

interface Item {
  name: string;
  value: number;
  value_piece: string;
  description: string;
  weight: number;
}

interface Bag extends Item {
  inventory: Item[];
}

type Coin = "CP" | "SP" | "EP" | "GP" | "PP"
type Wallet = {
  [key: string]: number;
};

interface Inventory {
  wallet: Wallet;
  items: Item[];
  bags: Bag[];
}

interface Character {
  name: string;
  inventory: Inventory;
}

const COIN_TYPES = ["CP", "SP", "EP", "GP", "PP"]
const EMPTY_CHARACTERS = []

const InventoryScreen = () => {
  const [character, setCharacter] = useState<Character>()
  const [isCreatingItem, setIsCreatingItem] = useState(false)

  useEffect(() => {
    if (character == null) return;
    console.log(character)
    localStorage.setItem("inventory", JSON.stringify(character))
  }, [character]);

  useEffect(() => {
    const inventory = localStorage.getItem("inventory")
    if (inventory == null) {
      setCharacter({
        name: "Character",
        inventory: {
          wallet: {"CP": 0, "SP": 0, "EP": 0, "GP": 0, "PP": 0},
          items: [],
          bags: [],
        }
      })
    } else {
      setCharacter(JSON.parse(inventory))
    }
  }, [])

  if (character == null) return <></>;

  return (
    <div>
      <h1>Character</h1>
      <h3>Total
        weight: {(character.inventory.items.map(item => item.weight).reduce((acc, curr) => acc + curr, 0) + Object.values(character.inventory.wallet).reduce((acc, curr) => acc + curr, 0) * 0.01).toFixed(2)} </h3>
      <div style={{display: "flex", justifyContent: "space-evenly"}}>
        {Object.entries(character.inventory.wallet).map(([piece, value]) => (
          <WalletItem
            key={piece+value}
            value={value}
            type={piece}
            onChange={(value) => {
              setCharacter(character => {
                if (character == null) return character
                character.inventory.wallet[piece] = value;
                return {...character}
              })
            }}
          />
        ))}
      </div>
      <hr/>
      <div style={{display: "flex", justifyContent: "center"}}>
        {isCreatingItem ?
          <InventoryItemCreate
            onConfirm={(item) => {
              setCharacter(character => {
                  if (character == null) return character
                  character.inventory.items.push(item)
                  return {...character};
                }
              )
              setIsCreatingItem(false)
            }}
          />
          :
          <button onClick={() => setIsCreatingItem(true)}> + Add Item</button>
        }
      </div>
      {character.inventory.items.map((item, i) => (
        <InventoryItem
          key={item.name}
          value={item}
          onDelete={() => {
            if (!window.confirm("Are you sure you want to delete?")) return
            setCharacter(character => {
              if (character == null) return character
              character.inventory.items.splice(i, 1)
              return {...character}
            })
          }}
          onSell={() => {
            if (!window.confirm("Are you sure you want to sell?")) return
            setCharacter(character => {
              if (character == null) return character
              console.log(item.value_piece, item.value)
              character.inventory.wallet[item.value_piece] += item.value;
              character.inventory.items.splice(i, 1)
              return {...character}
            })
          }}
        />
      ))}
    </div>
  )
}

export default InventoryScreen