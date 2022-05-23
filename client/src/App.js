import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MapComponent from './Map'
import './App.css'
var fileDownload = require('js-file-download');

//test new commit

const App = () => {
  // data that will be displayed
  const [data, setData] = useState({})
  // initial fetched data
  const [originalData, setOriginalData] = useState({})
  // pagination state variables
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)
  const pageLimit = 5
  const dataLimit = 24
  // map hover effect
  const [hover, setHover] = useState(Array(dataLimit).fill(false))
  // user input state variables (inputs & buttons)
  const [searchAvailInput, setSearchAvailInput] = useState('')
  const [searchDaysInput, setSearchDaysInput] = useState('')
  const [searchZoneInput, setSearchZoneInput] = useState('')
  const [bookmarkInputs, setBookmarkInputs] = useState(Array(dataLimit).fill(''))
  const [downloadButton, setDownloadButton] = useState(false)

  // on initial page load, send GET request from our backend /locations
  useEffect(() => {
    axios.get('/locations')
      .then(
        res => {
          let jd = JSON.parse(res.data.data)
          setData(jd)
          setOriginalData(jd)
          setPages(Math.round(Object.keys(jd.STORE_ID).length))
        }
      ).catch(
        error => {
          console.log(error)
        }
      )
  }, [])

  // QoL: when user changes page, scroll to top of page
  useEffect(() => {
    window.scrollTo({ behavior: 'smooth', top: '0px' });
  }, [currentPage]);

  // pagination helper functions:
  function goToNextPage() {
    setCurrentPage((page) => page + 1)
  }

  function goToPreviousPage() {
    setCurrentPage((page) => page - 1)
  }

  function changePage(event) {
    const pageNumber = Number(event.target.textContent)
    setCurrentPage(pageNumber)
  }

  const getPaginatedData = () => {
    const startIndex = currentPage * dataLimit - dataLimit
    const endIndex = startIndex + dataLimit
    if (Object.keys(data).length) {
      let store = Object.values(data.STORE_ID).slice(startIndex, endIndex)
      let lat = Object.values(data.LATITUDE).slice(startIndex, endIndex)
      let long = Object.values(data.LONGITUDE).slice(startIndex, endIndex)
      let daysOpen = Object.values(data.DAYS_OPEN).slice(startIndex, endIndex)
      let itemAvailability = Object.values(data.ITEM_AVAILABILITY).slice(startIndex, endIndex)
      let zone = Object.values(data.ZONE).slice(startIndex, endIndex)
      let bookmarks = Object.values(data.BOOKMARKS).slice(startIndex, endIndex)
      return {
        'STORE_ID': store,
        'LATITUDE': lat,
        'LONGITUDE': long,
        'DAYS_OPEN': daysOpen,
        'ITEM_AVAILABILITY': itemAvailability,
        'ZONE': zone,
        'BOOKMARKS': bookmarks
      }
    }
    else {
      return null
    }
  }

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit
    return new Array(pageLimit).fill().map((_, idx) => start + idx + 1)
  }

  // render previous, next, and pagination buttons
  const renderPagination = () => {
    return (
      <>
        <button className={`prev ${currentPage === 1 ? 'disabled' : ''}`} onClick={goToPreviousPage}>
          prev
        </button>

        <div>
          {getPaginationGroup().map((item, index) => (
            <button key={index} className={`pagination-item ${currentPage === item ? 'active' : null}`} onClick={changePage}>
              <span style={{color: `inherit`}}>{item}</span>
            </button>
          ))}
        </div>

        <button className={`next ${currentPage === pages ? 'disabled' : ''}`} onClick={goToNextPage}>
          next
        </button>
      </>
    )
  }

  // hover over map effect helper functions:
  const handleHoverOn = (index) => {
    let h = [...hover]
    h[index] = true
    setHover(h)
  }

  const handleHoverOff = (index) => {
    let h = [...hover]
    h[index] = false
    setHover(h)
  }

  // bookmark helper functions:
  const handleBookmarkChange = (event, index) => {
    let bookmarks = [...bookmarkInputs]
    bookmarks[index] = event.target.value
    setBookmarkInputs(bookmarks)
  }

  // send PUT request to /bookmark with user input and STORE_ID as query parameters
  const addBookmark = (event, store_id, index) => {
    event.preventDefault()
    let bookmarks = [...bookmarkInputs]
    axios
    .put(`/bookmark?bookmark=${bookmarks[index]}&store_id=${store_id}`)
    .then(res => {
      console.log(res)
      bookmarks[index] = ''
      setBookmarkInputs(bookmarks)
      setData(JSON.parse(res.data.data))
    })
    .catch(error => {
      console.log(error)
    })
  }

  // render the data. returns paginated grid of Maps that can be hovered for more information/input
  const showData = () => {
    let d = getPaginatedData()
    if (d === null) return <p>Loading...</p>
    else if (!d.STORE_ID.length) return <p>No results found.</p>
    else {
      return d.STORE_ID.map((s, index) => (
        <div key={s} style={{margin: `40px auto`, padding: `0 20px`, position: `relative`}}>
          <MapComponent coords={[d.LATITUDE[index], d.LONGITUDE[index]]} />
          <div
            onMouseEnter={() => handleHoverOn(index)}
            onMouseLeave={() => handleHoverOff(index)}
            style={hover[index] ?
              {position: `absolute`, textAlign: `right`, inset: `0`, width: `360px`, height: `360px`, margin: `auto`, padding: `20px`, zIndex: `20`, borderRadius: `60px`, background: `rgba(50, 10, 40, 0.9)`, opacity: `1`} :
              {position: `absolute`, textAlign: `right`, inset: `0`, width: `360px`, height: `360px`, margin: `auto`, padding: `20px`, zIndex: `20`, borderRadius: `60px`, opacity: `0`}}
          >
            <p style={{color: `white`, fontSize: `18px`}}>Store ID: {s}</p>
            <p style={{color: `white`, fontSize: `18px`}}>Days Open: {d.DAYS_OPEN[index]}</p>
            <p style={{color: `white`, fontSize: `18px`}}>Items Available: {d.ITEM_AVAILABILITY[index]}</p>
            <p style={{color: `white`, fontSize: `18px`}}>Zone:<br />{d.ZONE[index]}</p>
            {d.BOOKMARKS[index] && <p style={{color: `white`, fontSize: `18px`}}>Bookmark:<br />{d.BOOKMARKS[index]}</p>}
            <form method="PUT" onSubmit={event => addBookmark(event, s, index)}>
              <input className='bookmark-input' type="text" name="bookmark" value={bookmarkInputs[index]} onChange={event => handleBookmarkChange(event, index)} placeholder={d.BOOKMARKS[index] ? 'Replace Bookmark' : 'Add Bookmark'} />
              <input type="hidden" name="store_id" value={s} />
              <button className='bookmark-button' type="submit">
                {d.BOOKMARKS[index] ? 'Replace' : 'Add'}
              </button>
            </form>
          </div>
        </div>
      ))
    }
  }

  // handle search and download. send POST request to /search with various query parameters
  const handleSubmit = (event) => {
    event.preventDefault()

    let didDownload = downloadButton
    setDownloadButton(false)

    axios
      .post(`/search?availability=${searchAvailInput}&days_open=${searchDaysInput}&zone=${searchZoneInput}&download=false`)
      .then(res => {
        if (res.data.data === undefined) {
          setData(originalData)
          setPages(Math.round(Object.keys(originalData.STORE_ID).length))
        }
        else {
          let jd = JSON.parse(res.data.data)
          console.log(jd)
          setData(jd)
          setPages(Math.round(Object.keys(jd.STORE_ID).length))
        }
        setCurrentPage(1)
      })
      .catch(error => {
        console.log(error)
      })
    
    if (didDownload) {
      axios
        .post(`/search?availability=${searchAvailInput}&days_open=${searchDaysInput}&zone=${searchZoneInput}&download=true`)
        .then(res => {
          fileDownload(res.data, 'search_results.csv')
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  // App render
  return (
    <div style={{width: `100%`, maxWidth: `1920px`, margin: `auto`}}>
      <h1>Store Locations</h1>

      <div style={{marginBottom: `60px`, borderTop: `1px solid #6A7FDB`}} />

      <div>
        <div className='search-container'>
          <form method="POST" onSubmit={event => handleSubmit(event)}>
            <div style={{display: `flex`, justifyContent: `center`, alignItems: `center`, flexWrap: `wrap`}}>
              <input type="text" name="availability" value={searchAvailInput} onChange={(e) => setSearchAvailInput(e.target.value)} placeholder="Search Availability Count" />
              <input type="text" name="days_open" value={searchDaysInput} onChange={(e) => setSearchDaysInput(e.target.value)} placeholder="Search Days Open" />
              <input type="text" name="zone" value={searchZoneInput} onChange={(e) => setSearchZoneInput(e.target.value)} placeholder="Search Zone" />
            </div>
            <div style={{display: `flex`, justifyContent: `center`, alignItems: `center`, flexWrap: `wrap`, margin: `30px 0 60px`}}>
              <button className='search-button' type="submit">Search</button>
              <button className='download-button' type="submit" name="download" value={downloadButton} onClick={() => setDownloadButton(true)}>Download &amp; Search</button>
            </div>
          </form>
        </div>
        <div className='pagination-container' style={{margin: `30px 0 20px`}}>
          {renderPagination()}
        </div>
      </div>

      <div className='data-container' style={{display: `flex`, justifyContent: `center`, alignItems: `center`, flexWrap: `wrap`}}>
        {showData()}
      </div>

      <div className='pagination-container' style={{margin: `20px 0 30px`}}>
        {renderPagination()}
      </div>
    </div>
  )
}

export default App