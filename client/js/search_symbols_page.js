SEARCH_SYMBOLS_PAGE = {
  current_search_symbol:'search for a sabian symbol',


  init:()=>{
    console.log('init the search page')
    $('#search_symbols_input').on('focus', (e) => {
      console.log('focus')
      SABIAN_SYMBOLS.on_focus(e.target)
    })
    $('#search_symbols_input').on('input', (e) => {
      console.log('input')

      SABIAN_SYMBOLS.search_available_symbol_data(e.target)
    })
    $('#current_search_symbol').text(SEARCH_SYMBOLS_PAGE.current_search_symbol)

  },
  set_current_value:(sabian_symbol)=>{
    console.log('set_current_value in search sabina symbols page')
    SEARCH_SYMBOLS_PAGE.current_search_symbol = sabian_symbol
    $('#current_search_symbol').text(SEARCH_SYMBOLS_PAGE.current_search_symbol)

    console.log(sabian_symbol)
    //get the data from SABIAN_SYMBOLS.symbols_data_obj
    console.log(SABIAN_SYMBOLS.symbols_data_obj[sabian_symbol])
    SEARCH_SYMBOLS_PAGE.display_results(SABIAN_SYMBOLS.symbols_data_obj[sabian_symbol])
  },
  display_results:(data_obj_array)=>{
    var search_symbols_results_table = $('#search_symbols_results_table')
    //first clear any old results
    search_symbols_results_table.html('')
    var td_array = []
    data_obj_array.forEach((data_obj)=>{
      for (let key in data_obj) {
        var tr = document.createElement('tr')
        var td_name = document.createElement('td')
        var td_planet = document.createElement('td')
        td_name.innerText = key
        td_planet.innerText = data_obj[key]
        tr.appendChild(td_name)
        tr.appendChild(td_planet)
        search_symbols_results_table.append(tr)
      }
    })



  }
}