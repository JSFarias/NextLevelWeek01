import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft, FiAlertOctagon} from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'

import axios from 'axios'
import api from '../../services/api'

import './style.css'

import logo from '../../assets/logo.svg'

import Dropzone from '../../components/Dropzone'


interface Item {
  id: number
  title: string
  image_url: string
}

interface IBGEUFResponse{
  sigla: string
}

interface IBGECityResponse{
  nome: string
}


const CreatePoint = () =>{

  const history = useHistory()

  const [items, setItems] = useState<Item[]>([])
  useEffect(()=>{
    api.get('items').then(response => {
      setItems(response.data)
    })
  },[])


  const [ufs, setUFs] = useState<string[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('0')
  useEffect(() =>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{

      const ufInitials = response.data.map(uf => uf.sigla)
      setUFs(ufInitials)
      
    })
  },[])


  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('0')
  useEffect(()=>{
    
    if(selectedUf === '0')
    return

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {   

      const citiesNames = response.data.map(name => name.nome)
      setCities(citiesNames)

    })
  },[selectedUf])

  function handleSelectUF(e: ChangeEvent<HTMLSelectElement>) {
    const uf = e.target.value
    setSelectedUf(uf)
  }

  function handleSelectedCity(e: ChangeEvent<HTMLSelectElement>){
    const city = e.target.value
    setSelectedCity(city)
  }


  const [initialPos, setInitialPos] = useState<[number, number]>([0 ,0])
  const [selectedPos, setSelectedPos] = useState<[number, number]>([0 ,0])
  function handleMapClick(e: LeafletMouseEvent){
    setSelectedPos([
      e.latlng.lat, 
      e.latlng.lng
    ])
  }


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp:'',
  })

  const [selectedItems, setSelectedItems] = useState<number[]>([])
  function handleItemClick(id: number){

    const items = selectedItems.includes(id)? 
      selectedItems.filter(item => item !== id) : 
      [...selectedItems ,id]

    setSelectedItems(items)
  }

  const [selectedFile, setSelectedFile] = useState<File>()


  function handleinputChange(e: ChangeEvent<HTMLInputElement>){
    const {name, value} = e.target
    setFormData({...formData, [name]: value})
  }


  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position =>{
      setInitialPos([
        position.coords.latitude,
        position.coords.longitude
      ])
      console.log(position)
    })
  },[]) 

  async function handleSubmit (e: FormEvent){
    e.preventDefault()

    const {name, email, whatsapp} = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPos
    const items = selectedItems

    const data = new FormData()
    
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if(selectedFile){
      data.append('image', selectedFile);
    }

    await api.post('points', data)

    alert('Ponto de coleta criado com sucesso!')

    history.push('/')

  }


  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta-logo"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit} action='/create-point'>
        <h1>Cadastro do <br/> ponto de coleta</h1>
        
        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleinputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleinputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleinputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPos} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPos} />
          </Map>
          
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                name="uf" 
                id="uf" 
                value={selectedUf} 
                onChange={handleSelectUF}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectedCity}
              >
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítems de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
            
              <li 
                key={item.id}
                onClick={()=>handleItemClick(item.id)} 
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
              
            ))}   
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint

