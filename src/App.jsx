import { useState, useEffect } from 'react'
import './App.css'
import { SKILLS, generateAttributes, rollNd6, fetchGeminiDescription, generateOccupationData, useOccupationEffect
} from './AppLogic.js';
import './particles.css';
import '../public/particles-init.js';


// coc_webapp_starter - React + Tailwind project



function App() {
  const [roll, setRoll] = useState(null);
  const [step, setStep] = useState(0);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token") || null);
  const [character, setCharacter] = useState({
    name: "",
    familyname: "",
    age: "",
    occupation: "",
    residence: "",
    birthplace: "",
    backstory: {
      personalDescription: "",
      ideology: "",
      significantPeople: "",
      meaningfulLocations: "",
      treasuredPossessions: "",
      traits: "",
      injuriesScars: "",
      phobiasManias: "",
      arcaneTomes: "",
      encounters: "",
      generalBackstory: ""
    },
    equipment: {
      weapons: "",
      tools: "",
      clothes: "",
      special: "",
      other: "",
    },
    attributes: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 0,
      SIZ: 0,
      POW: 0,
      APP: 0,
      EDU: 0,
      LUCK: 0,
      HP: 0,
      SAN: 0,
      MP: 0,
      Dodge: 0,
    },
    skills: SKILLS.map((s) => ({ ...s, value: s.base, improved: false })),
  });

    const [occupationDetails, setOccupationDetails] = useState(null);

    const [debouncedOccupation, setDebouncedOccupation] = useState("");

    const [attributeRollResults, setAttributeRollResults] = useState({});


    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedOccupation(character.occupation);
      }, 2500); // number here is the delay in microseconds
      return () => clearTimeout(handler);
    }, [character.occupation]);

    useEffect(() => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken !== authToken) {
        setAuthToken(storedToken);
      }
    }, []);


    useOccupationEffect(debouncedOccupation, setOccupationDetails);

    const steps = ["Attributes", "Identity", "Skills", "Equipment", "Backstory", "Condensed Character Sheet"];

    const resetCharacter = () => {
      if (confirm("Are you sure you want to reset the character?")) {
        setCharacter({
          name: "",
          familyname: "",
          age: "",
          occupation: "",
          residence: "",
          birthplace: "",
          backstory: {
            personalDescription: "",
            ideology: "",
            significantpeople: "",
            meaningfulLocations: "",
            treasuredPossessions: "",
            traits: "",
            injuriesScars: "",
            phobiasManias: "",
            arcaneTomes: "",
            encounters: "",
            generalBackstory: ""
          },
          occupationpoints: 0,
          equipment: {
            weapons: "",
            tools: "",
            clothes: "",
            special: "",
            other: "",
          },
          attributes: {
            STR: 0,
            CON: 0,
            DEX: 0,
            INT: 0,
            SIZ: 0,
            POW: 0,
            APP: 0,
            EDU: 0,
            LUCK: 0,
            HP: 0,
            SAN: 0,
            MP: 0,
            Dodge: 0,
            Personal_Points: 0,
          },
          skills: SKILLS.map((s) => ({ ...s, value: s.base, improved: false })),
        });
        alert("Character reset.");
      }
    };
    
    const rollDice = (index, target, isAttribute = false) => {
      const d100 = Math.floor(Math.random() * 100) + 1;
      let result = 'Fail';
      if (d100 <= target) result = 'Success';
      if (d100 <= target / 2) result = 'Hard Success';
      if (d100 <= target / 5) result = 'Extreme Success';
    
      if (isAttribute) {
        setAttributeRollResults(prev => ({ ...prev, [index]: { d100, result } }));
      } else {
        const updatedSkills = [...character.skills];
        updatedSkills[index].rollResult = { d100, result };
        setCharacter(prev => ({ ...prev, skills: updatedSkills }));
      }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCharacter((prev) => ({ ...prev, [name]: value }));
      };
    
    const handleAttrChange = (e) => {
        const { name, value } = e.target;
        setCharacter((prev) => ({
          ...prev,
          attributes: {
            ...prev.attributes,
            [name]: Number(value),
          },
        }));
      };

    const handleEquipmentChange = (e) => {
        const { name, value } = e.target;
        setCharacter((prev) => ({
          ...prev,
          equipment: {
            ...prev.equipment,
            [name]: value,
          },
        }));
      };



    const handleSkillChange = (index, value) => {
        setCharacter((prev) => {
          const updatedSkills = [...prev.skills];
          updatedSkills[index].value = Number(value);
          return { ...prev, skills: updatedSkills };
        });
      };

    const toggleSkillImproved = (index) => {
        setCharacter((prev) => {
          const updatedSkills = [...prev.skills];
          updatedSkills[index].improved = !updatedSkills[index].improved;
          return { ...prev, skills: updatedSkills };
        });
      };

    const splitSkillsIntoColumns = (skills, columns) => {
        const perColumn = Math.ceil(skills.length / columns);
        return Array.from({ length: columns }, (_, colIndex) =>
          skills.slice(colIndex * perColumn, colIndex * perColumn + perColumn)
        );
      };


    const skillColumns = splitSkillsIntoColumns(character.skills, 4);


    const rollWeaponDamage = (damageString) => {
      const regex = /^(\d*)d(\d+)([+-]\d+)?$/i;
      const match = damageString.toLowerCase().replace(/\s+/g, '').match(regex);

      if (!match) return 'Invalid';

      const numDice = parseInt(match[1] || '1', 10); // Defaults to 1 if blank
      const diceSides = parseInt(match[2], 10);
      const modifier = parseInt(match[3] || '0', 10);

      let total = 0;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSides) + 1;
      }

      return total + modifier;
    };

    const saveCharacter = async () => {
      const token = localStorage.getItem('authToken');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      if (!token) {
        alert("You must be logged in to save.");
        return;
      }

      try {
        const response = await fetch('https://cocbeyond.onrender.com/api/save-character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ character })
        });

        const result = await response.json();
        alert(result.message || "Character saved.");
      } catch (error) {
        console.error("Error saving character:", error);
        alert("Save failed.");
      }
    };

    const loadCharacter = async () => {
      const token = localStorage.getItem('authToken');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      if (!token) {
        alert("You must be logged in to load.");
        return;
      }

      try {
        const response = await fetch('https://cocbeyond.onrender.com/api/load-character', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.character) {
          setCharacter(data.character);
        } else {
          alert("No saved character found.");
        }
      } catch (error) {
        console.error("Error loading character:", error);
        alert("Load failed.");
      }
    };



    function AuthFormInline({ authToken, setAuthToken}) {
      const [mode, setMode] = useState("login");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [showForm, setShowForm] = useState(false);

      const handleLogout = () => {
        localStorage.removeItem("authToken");
        setAuthToken(null);
      };

      const handleSubmit = async () => {
        const endpoint = `https://cocbeyond.onrender.com/api/${mode}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          setAuthToken(data.token);
          setShowForm(false);
        } else {
          alert(data.error || 'Something went wrong');
        }
      };

      return (
        <div className="relative text-sm">
          {!authToken ? (
            <div className="relative">
              <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#7f56d9] hover:bg-[#6843c1] rounded">
                {mode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
              {showForm && (
                <div className="absolute right-0 top-12 z-50 bg-eldritch-panel border border-eldritch-accent p-4 rounded shadow-xl w-64">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-2 p-2 text-black rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-2 p-2 text-black rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={handleSubmit} className="w-full px-3 py-1 bg-eldritch-accent hover:bg-eldritch-highlight rounded mb-2">
                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                  <p
                    className="text-xs text-center text-gray-400 cursor-pointer"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  >
                    {mode === 'login' ? "Need an account? Sign up" : "Have an account? Log in"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleLogout} className="px-4 py-2 bg-eldritch-danger hover:bg-eldritch-danger/80 rounded">
              Log Out
            </button>
          )}
        </div>
      );
    }

    const getOccupationSkillTotal = () => {
      if (!occupationDetails || !Array.isArray(occupationDetails.skills)) return 0;

      return character.skills.reduce((sum, s) => {
        const isOccupationSkill = occupationDetails.skills.includes(s.name);
        const spent = s.value - s.base;
        return isOccupationSkill && spent > 0 ? sum + spent : sum;
      }, 0);
    };

    const getPersonalSkillTotal = () => {
      if (!occupationDetails || !Array.isArray(occupationDetails.skills)) return 0;

      return character.skills.reduce((sum, s) => {
        const isOccupationSkill = occupationDetails.skills.includes(s.name);
        const spent = s.value - s.base;
        return !isOccupationSkill && spent > 0 ? sum + spent : sum;
      }, 0);
    };

    const autoGenerateEquipment = async () => {
      try {
        const [equipRes, weaponRes, toolRes, clothesRes] = await Promise.all([
          fetch('https://cocbeyond.onrender.com/api/generate-equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occupation: character.occupation })
          }),
          fetch('https://cocbeyond.onrender.com/api/generate-weapon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occupation: character.occupation })
          }),
          fetch('https://cocbeyond.onrender.com/api/generate-tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occupation: character.occupation })
          }),
          fetch('https://cocbeyond.onrender.com/api/generate-clothes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occupation: character.occupation })
          })
        ]);

        const { equipment } = await equipRes.json();
        const { weapon } = await weaponRes.json();
        const { tool } = await toolRes.json();
        const { clothes } = await clothesRes.json();

        const cleanedItems = Array.isArray(equipment)
          ? equipment.map(item => ({
              name: item.name || '',
              quantity: item.quantity || 1,
              weight: parseFloat(item.weight) || 0,
            }))
          : [];

        const cleanedWeapon = {
          name: weapon.name || '',
          damage: weapon.damage || '',
          range: weapon.range || '',
          usesPerRound: weapon.usesPerRound || '',
          bullets: weapon.bullets ?? 'N/A',
          cost: weapon.cost || '',
          malfunction: weapon.malfunction || ''
        };

        const cleanedTools = Array.isArray(tool)
          ? tool.map(item => ({
            name: item.name || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            cost: item.cost || '',
            weight: parseFloat(item.weight) || 0,
            useCase: item.useCase || ''
            }))
          : [];
        
        console.log("Clothes API returned:", clothes);
        const cleanedClothes = Array.isArray(clothes)
          ? clothes.map(item => ({
            name: item.name || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            cost: item.cost || 0,
            weight: parseFloat(item.weight) || 0
            }))
          : [];


        setCharacter(prev => ({
          ...prev,
          equipment: {
            ...prev.equipment,
            special: cleanedItems,
            weapons: cleanedWeapon,
            tools: cleanedTools,
            clothes: cleanedClothes
          }
        }));
      } catch (err) {
        console.error("Auto-generation failed:", err);
        alert("Failed to generate equipment.");
      }
    };

    const [authMode, setAuthMode] = useState('login'); // or 'signup'
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

    const handleAuthSubmit = async () => {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      try {
        const res = await fetch(`https://cocbeyond.onrender.com/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('authToken', data.token);
          setIsLoggedIn(true);
        } else {
          alert(data.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('Auth Error:', err);
        alert('Auth request failed');
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
    };

    const isCharacterReady = () =>
      Object.values(character.attributes).every(val => val > 0);

    const [weaponRollResult, setWeaponRollResult] = useState(null);
    

    const renderStep = () => {
      switch (step) {
        case 0:
          return (
            <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
              <h2 className="text-xl font-bold mb-3 text-eldritch-highlight uppercase tracking-wide">Attributes</h2>
              <button
                onClick={() => {
                  const newAttributes = generateAttributes();
                  setCharacter((prev) => ({
                    ...prev,
                    attributes: { ...newAttributes },
                  }));
                }}
                className="px-3 py-1 mb-2 text-md font-bold tracking-wider uppercase rounded-lg 
                          shadow-md transition-all duration-200
                          bg-eldritch-accent text-black 
                          hover:bg-eldritch-highlight hover:text-white 
                          active:scale-95 border-2 border-eldritch-accent"
              >
                🎲 Roll Attributes
              </button>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(character.attributes).map(([attr, val]) => (
                  <div key={attr} className="flex flex-col text-center items-center">
                    <label className="text-eldritch-accent text-sm font-medium mb-1">{attr}</label>
                    <input type="number" name={attr} value={val} onChange={handleAttrChange} className="text-black px-2 py-1 rounded w-20 text-center" />
                  </div>
                ))}
              </div>
            </div>
          );
        case 1:
          return (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 gap-6 mb-6">
                <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent">
                  <h2 className="text-xl font-bold mb-3 text-eldritch-highlight uppercase tracking-wide">Identity</h2>
                  <label className="block mb-1 text-eldritch-accent">Name</label>
                  <input type="text" name="name" value={character.name} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                  <label className="block mb-1 text-eldritch-accent">Sur Name</label>
                  <input type="text" name="familyname" value={character.familyname} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3"/>
                  <label className="block mb-1 text-eldritch-accent">Occupation</label>
                  <input type="text" name="occupation" value={character.occupation} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                  <label className="block mb-1 text-eldritch-accent">Age</label>
                  <input type="number" name="age" value={character.age} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                  <text ></text>
                  <label className="block mb-1 text-eldritch-accent">Residence</label>
                  <input type="text" name="residence" value={character.residence} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                  <label className="block mb-1 text-eldritch-accent">Birthplace</label>
                  <input type="text" name="birthplace" value={character.birthplace} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                </div>
              </div>
              {occupationDetails && (
              <div className="w-full md:w-1/2 gap-6 mb-6">
                <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent">
                  <h2 className="text-xl font-bold mb-3 text-eldritch-highlight uppercase tracking-wide">Additional Info</h2>
                  <label className="block mb-3 text-eldritch-accent">
                    Occupation Data: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.description}</span>
                  </label>
                  <label className="block mb-3 text-eldritch-accent">
                    Credit Rating: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.creditRating}</span>
                  </label>
                  <label className="block mb-3 text-eldritch-accent">
                    Occupation Skills: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.skills.join(', ')}</span>
                  </label>
                  <label className="block mb-3 text-eldritch-accent">
                    Occupation Pts: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.points}</span>
                  </label>
                </div>
  </div>
)}
            </div>
          );
        case 2:
          return (
            <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-eldritch-highlight uppercase tracking-wide">Skills</h2>
                {occupationDetails && (
                  <div className="text-sm text-right text-eldritch-highlight font-mono">
                    <p>
                      Occupation: {getOccupationSkillTotal()} / {occupationDetails.points || "?"}
                    </p>
                    <p>
                      Personal: {getPersonalSkillTotal()} / {character.attributes.Personal_Points || "?"}
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {skillColumns.map((column, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-4">
                    {column.map((skill, index) => (
                      <div key={skill.name} className="bg-eldritch-panel/45 p-2 rounded border border-gray-600 shadow-md">
                        <label className="block font-semibold text-sm mb-1 text-eldritch-highlight tracking-wide">{skill.name}</label>
                        <div className="flex items-center gap-2">
                          <input type="number" value={skill.value} onChange={(e) => handleSkillChange(character.skills.findIndex((s) => s.name === skill.name), e.target.value)} className="text-black px-2 py-1 rounded w-20 text-sm" />
                          <input type="checkbox" checked={skill.improved} onChange={() => toggleSkillImproved(character.skills.findIndex((s) => s.name === skill.name))} />
                          <span className="text-xs text-gray-400">✓</span>
                          <button onClick={() => rollDice(character.skills.findIndex((s) => s.name === skill.name), skill.value)}className="ml-auto px-3 py-1 bg-[#4ca892] hover:bg-eldritch-highlight text-xs rounded">Roll</button>{skill.rollResult && (<div className="text-xs mt-1 text-eldritch-accent ml-2">{skill.rollResult.d100} - {skill.rollResult.result}</div>)}
                        </div>
                        <div className="text-xs mt-1 text-gray-400">Half: {Math.floor(skill.value / 2)} | Fifth: {Math.floor(skill.value / 5)}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
          case 3:
            return (
              <div className="bg-eldritch-panel/45 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
                <h2 className="text-xl font-bold mb-4 text-eldritch-highlight uppercase tracking-wide">Equipment</h2>
                <button
                  onClick={autoGenerateEquipment}
                  className="ml-2 px-3 py-1 bg-eldritch-link hover:bg-eldritch-link/80 text-sm rounded"
                >
                  Auto-Generate
                </button>

                {Object.entries(character.equipment).map(([category, value]) => (
                  <div key={category} className="mb-4">
                    <label className="block text-eldritch-accent font-semibold mb-1 uppercase tracking-wide">{category}</label>

                    {category === "weapons" && value && typeof value === "object" ? (
                      [value].map((weapon, idx) => (
                        <div key={idx} className="mb-4 p-3 bg-gray-800/40 rounded border border-gray-600">
                          <p className="text-eldritch-accent font-bold text-lg mb-2">{weapon.name}</p>
                          <p className="text-sm text-gray-300">
                            <span className="text-eldritch-highlight">Damage:</span> {weapon.damage} |{" "}
                            <span className="text-eldritch-highlight">Range:</span> {weapon.range} |{" "}
                            <span className="text-eldritch-highlight">Uses/Round:</span> {weapon.usesPerRound} |{" "}
                            <span className="text-eldritch-highlight">Bullets:</span> {weapon.bullets || "N/A"} |{" "}
                            <span className="text-eldritch-highlight">Cost:</span> {weapon.cost} |{" "}
                            <span className="text-eldritch-highlight">Malfunction:</span> {weapon.malfunction || "N/A"}
                          </p>
                        </div>
                      ))
                    ) : category === "tools" && Array.isArray(value) ? (
                      value.map((tool, idx) => (
                        <div key={idx} className="mb-3 p-3 bg-gray-800/40 rounded border border-gray-600">
                          <p className="text-eldritch-accent font-bold">{tool.name}</p>
                          <p className="text-gray-300 text-sm mb-1">{tool.description}</p>
                          <p className="text-gray-400 text-xs italic">Use: {tool.useCase}</p>
                          <p className="text-sm text-white">Qty: {tool.quantity || 1}, Cost: {tool.cost}, Wt: {tool.weight} lbs</p>
                        </div>
                      ))
                    ) : category === "clothes" && Array.isArray(value) ? (
                      value.map((item, idx) => (
                        <div key={idx} className="mb-3 p-3 bg-gray-800/40 rounded border border-gray-600">
                          <p className="text-eldritch-accent font-bold">{item.name}</p>
                          <p className="text-gray-300 text-sm mb-1">{item.description}</p>
                          <p className="text-sm text-white">Qty: {item.quantity || 1}, Cost: {item.cost}, Wt: {item.weight} lbs</p>
                        </div>
                      ))
                    ) : Array.isArray(value) ? (
                      value.map((item, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updatedItems = [...value];
                              updatedItems[idx].name = e.target.value;
                              setCharacter((prev) => ({
                                ...prev,
                                equipment: {
                                  ...prev.equipment,
                                  [category]: updatedItems
                                }
                              }));
                            }}
                            className="text-black px-2 py-1 rounded w-1/2"
                            placeholder="Item name"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updatedItems = [...value];
                              updatedItems[idx].quantity = parseInt(e.target.value, 10);
                              setCharacter((prev) => ({
                                ...prev,
                                equipment: {
                                  ...prev.equipment,
                                  [category]: updatedItems
                                }
                              }));
                            }}
                            className="text-black px-2 py-1 rounded w-1/6"
                            placeholder="Qty"
                          />
                          <input
                            type="number"
                            value={item.weight}
                            onChange={(e) => {
                              const updatedItems = [...value];
                              updatedItems[idx].weight = parseFloat(e.target.value);
                              setCharacter((prev) => ({
                                ...prev,
                                equipment: {
                                  ...prev.equipment,
                                  [category]: updatedItems
                                }
                              }));
                            }}
                            className="text-black px-2 py-1 rounded w-1/6"
                            placeholder="Weight"
                          />
                        </div>
                      ))
                    ) : (
                      <textarea
                        name={category}
                        value={value}
                        onChange={handleEquipmentChange}
                        rows={3}
                        className="w-full p-2 rounded text-black"
                        placeholder={`Enter ${category} items...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
        case 4:
          return (
            <div className="bg-eldritch-panel rounded-xl shadow-lg p-6 border border-eldritch-accent mb-6">
              <h2 className="text-xl font-bold mb-6 text-eldritch-highlight uppercase tracking-wide">Backstory & Details</h2>
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left side - General Backstory (2/3) and narratively related fields */}
                <div className="w-full md:w-3/5 space-y-6">
                  {["generalBackstory", "personalDescription", "ideology", "significantPeople"].map((field) => (
                      <div key={field}>
                        <label className="block mb-1 text-eldritch-accent capitalize font-semibold">
                          {field
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^generalBackstory$/, "Backstory")
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <textarea
                          name={field}
                          value={character.backstory[field] || ""}
                          onChange={(e) =>
                            setCharacter((prev) => ({
                              ...prev,
                              backstory: {
                                ...prev.backstory,
                                [field]: e.target.value,
                              },
                            }))
                          }
                          rows={field === "generalBackstory" ? 6 : 5}
                          className="w-full p-3 rounded text-black resize-y"
                          placeholder={`Enter ${field === "generalBackstory" ? "main backstory" : field}...`}
                        />
                      </div>
                    ))}
                </div>
                {/* Right side - other fields (1/3) */}
                <div className="w-full md:w-2/5 space-y-4">
                  {Object.entries(character.backstory)
                    .filter(([key]) => !["generalBackstory", "personalDescription", "ideology", "significantPeople"].includes(key))
                    .map(([field, value]) => (
                      <div key={field}>
                        <label className="block mb-1 text-eldritch-accent capitalize font-semibold">
                          {field
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <textarea
                          name={field}
                          value={value}
                          onChange={(e) =>
                            setCharacter(prev => ({
                              ...prev,
                              backstory: {
                                ...prev.backstory,
                                [field]: e.target.value
                              }
                            }))
                          }
                          rows={3}
                          className="w-full p-2 rounded text-black resize-none"
                          placeholder={`Enter ${field}...`}
                        />
                      </div>
                  ))}
                </div>
              </div>
            </div>
          );


          case 5:
            return isCharacterReady() ? (
              <div className="bg-eldritch-panel/45 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
                <h2 className="text-2xl font-bold mb-6 text-eldritch-highlight uppercase tracking-wide">Summary</h2>

                {/* Identity + Attributes */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Identity Section */}
                  <div className="w-full md:w-1/3 space-y-4">
                    <h3 className="text-xl font-semibold text-eldritch-link mb-2">Identity</h3>
                    <p><strong>Name:</strong> {character.name}</p>
                    <p><strong>Occupation:</strong> {character.occupation}</p>
                    <p className="text-s"><strong>Occupation Data:</strong> {occupationDetails.description}</p>
                    <p><strong>Age:</strong> {character.age}</p>
                    <p><strong>Residence:</strong> {character.residence}</p>
                    <p><strong>Birthplace:</strong> {character.birthplace}</p>
                  </div>

                  {/* Attributes Section */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <h3 className="text-xl font-bold text-eldritch-link mb-1">Attributes</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(character.attributes).map(([key, val], index) => (
                        <div key={key} className="bg-eldritch-panel p-2 rounded border border-gray-700 text-center">
                          <p className="text-eldritch-accent font-bold">{key}</p>
                          <p className="text-white text-xl">{val}</p>
                          <button
                            onClick={() => rollDice(index, val, true)}
                            className="mt-2 px-2 py-1 text-xs bg-eldritch-link hover:bg-eldritch-link/80 rounded"
                          >
                            Roll
                          </button>
                          {attributeRollResults[index] && (
                            <div className="text-xs text-eldritch-accent mt-1">
                              🎲 {attributeRollResults[index].d100} – {attributeRollResults[index].result}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Skills Section */}
                <div className="w-full md:w-1/2">
                  <h3 className="text-lg font-semibold text-eldritch-link mb-2">Skills</h3>
                  <div className="space-y-1 text-sm text-white">
                    {character.skills.map((skill, idx) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between bg-eldritch-panel/25 px-2 py-1 rounded border border-gray-700"
                      >
                        <div className="w-2/5 truncate text-eldritch-highlight font-medium">{skill.name}</div>
                        <div className="w-1/4 text-xs text-gray-300 text-center">
                          {skill.value} / {Math.floor(skill.value / 2)} / {Math.floor(skill.value / 5)}
                        </div>
                        <button
                          onClick={() => rollDice(idx, skill.value)}
                          className="px-2 py-0.5 text-xs bg-eldritch-link hover:bg-eldritch-link/80 rounded"
                        >
                          Roll
                        </button>
                        {skill.rollResult && (
                          <div className="text-eldritch-accent text-xs ml-2 whitespace-nowrap">
                            🎲 {skill.rollResult.d100} – {skill.rollResult.result}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment Section */}
                <div className="w-full md:w-1/2">
                  <h3 className="text-lg font-semibold text-eldritch-link mb-2">Equipment</h3>
                  {Object.entries(character.equipment).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <p className="text-eldritch-accent font-bold mb-1 uppercase tracking-wide">{category}</p>

                      {/* Handle Weapon Object */}
                      {category === "weapons" && items && typeof items === 'object' ? (
                        <div className="text-sm text-white space-y-1">
                          <p>
                            {items.name} – {items.damage}, {items.range}, {items.usesPerRound} /rnd,
                            Bullets: {items.bullets || 'N/A'}, Cost: {items.cost}, Malfunction: {items.malfunction}
                          </p>
                          <button
                            onClick={() => setWeaponRollResult(rollWeaponDamage(items.damage))}
                            className="px-2 py-1 text-xs bg-eldritch-link hover:bg-eldritch-link/80 rounded"
                          >
                            Roll Damage
                          </button>
                          {weaponRollResult !== null && (
                            <p className="text-xs text-eldritch-accent">🎲 Damage Rolled: {weaponRollResult}</p>
                          )}
                        </div>

                      // Handle Tool or Clothing Arrays
                      ) : Array.isArray(items) ? (
                        <div className="space-y-1">
                          {items.map((item, i) => (
                            <p key={i} className="text-sm text-white">
                              • {item.name}{item.description ? ` – ${item.description}` : ''} (Qty: {item.quantity}, Wt: {item.weight} lbs{item.cost ? `, Cost: ${item.cost}` : ''})
                            </p>
                          ))}
                        </div>

                      // Handle fallback case (string or unexpected)
                      ) : (
                        <p className="text-sm text-white">{items}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              </div>
            ) : (
              <div className="bg-eldritch-panel/40 rounded-xl shadow-md p-6 border border-yellow-600 text-center text-yellow-200">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Character Sheet Locked</h2>
                <p className="mb-1">Please roll your Attributes to continue.</p>
              </div>
            );
        default:
          return null;
      }
    };

    return (
      <>
        {/* Particle background layer */}

        <div className="relative z-0 min-h-screen bg-black/5 text-white p-6 font-mono rounded-xl">
          <div className="flex justify-between items-center mb-6 border-b-4 border-eldritch-accent text-eldritch-highlight pb-2">
            <h1 className="text-4xl font-extrabold font-cinzel mb-6 text-left tracking-wide uppercase">
              Call of Cthulhu Character Creator
            </h1>
            <div className='flex gap-2'>
              {authToken && (
                <>
                  <button onClick={saveCharacter} className="px-5 py-2 bg-eldritch-accent hover:bg-[#3c8878] rounded">Save</button>
                  <button onClick={loadCharacter} className="px-5 py-2 bg-eldritch-link hover:bg-eldritch-accent/60 rounded">Load</button>
                  <button onClick={resetCharacter} className="px-5 py-2 bg-eldritch-danger hover:bg-eldritch-danger/80 rounded">Reset</button>
                </>
              )}
              <AuthFormInline authToken={authToken} setAuthToken={setAuthToken} />
            </div>
          </div>


          <div className="flex text-right mb-3 gap-1">
            {steps.map((label, idx) => (
              <button key={label} onClick={() => setStep(idx)} className={`px-3 py-1 rounded border ${idx === step ? 'bg-[#8effa0] text-black' : 'border-eldritch-accent text-eldritch-accent'}`}>
                {label}
              </button>
            ))}
          </div>

          {renderStep()}

          {roll && (
            <div className="mt-6 bg-eldritch-panel p-4 rounded border border-eldritch-accent">
              <p className="text-xl font-semibold">🎲 You rolled: {roll.d100}</p>
              <p className="text-2xl font-bold text-eldritch-accent">Result: {roll.result}</p>
              {roll.skillName && <p className="text-md text-gray-300">Skill: {roll.skillName}</p>}
            </div>
          )}
        </div>
      </>
    );
}
export default App;