SABIAN_SYMBOLS = {
  current_profile:'',
  current_profile_id:'',
  symbols_available:[],
  symbols_data_obj:{},
  save_state:true,
  symbols:['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Descendant', 'Midheaven', 'Nadir', 'North Node', 'South Node'],
  sabian_symbol_compared_values:[],
  hide_edit_view:false,
  init:()=>{
    console.log('Sabin symbols loading')
    SABIAN_SYMBOLS.get_all_profiles()
    SABIAN_SYMBOLS.set_up_sabian_symbol_edit_view();
    SABIAN_SYMBOLS.set_event_handlers();
    // SABIAN_SYMBOLS.init_compare_tool();
    SABIAN_SYMBOLS.utils.get_sabian_symbols_availale_array();


  },
  create_new_profile:(_name)=>{
    console.log(_name)
    //here we will call the API, and wait for response then add run add_new_profile_item_to_list
    $.post('/astrology/add_new_sabian_symbol_profile', {name:_name}, (resp)=>{
      console.log(resp)
      if(resp.message){
        let data = resp.message[0]
        let _id = data._id;
        let _symbol_data = data.symbol_data;
        SABIAN_SYMBOLS.add_new_profile_item_to_list(_name, _id)
        toastr.success('New profiel created')


      }
    })
  },
  save_profile:(_name, _data)=>{
    console.log(_name)
    const _id = SABIAN_SYMBOLS.current_profile_id
    //here we will call the API, and wait for response then add run add_new_profile_item_to_list
    $.post('/astrology/save_sabian_symbol_profile', {id:_id, name:_name, data:_data}, (resp)=>{
      console.log(resp)
      if(resp){
        SABIAN_SYMBOLS.set_save_state(true)
        SABIAN_SYMBOLS.symbols_available = resp.symbols_available
        SABIAN_SYMBOLS.symbols_data_obj = resp.symbol_count_data
        toastr.success('Profile Saved')
      }else{
        toastr.warning('That may not have saved....?')
      }
    })
  },
  set_save_state:(bool)=>{
    // console.log('save state')
    SABIAN_SYMBOLS.save_state = bool;
  },
  set_description_from_list:(e, input)=>{
    console.log(input)
    console.log(e)
    // console.log($(e).html())
    // console.log($(e).text())
    // console.log($(e).attr('data-text'))
    var sabian_symbol = $(e).attr('data-text')
    $(input).val(sabian_symbol)
    console.log('ooommmmgg')
    if(location.hash =="#search_symbols"){
      //call a function in the SEARCH_SYMBOLS_PAGE
      SEARCH_SYMBOLS_PAGE.set_current_value(sabian_symbol)
    }
  },
  remove_list_option:()=>{
    $('#filtered-list-container').remove()
  },
  listern_for_blur_to_remove_symbol_list:(input)=>{//listening for blur to do cleanup stuff
    console.log('BLURRRRRRR!@#')
    if(!SABIAN_SYMBOLS.save_state) SABIAN_SYMBOLS.save_sabian_symbol_profile()
    const trimmed_value = $(input).val().trim()
    $(input).val(trimmed_value)
    setTimeout(()=>{
      SABIAN_SYMBOLS.remove_list_option()      
    }, 200)//Hack to let the list be a target of click when the blur event happens

  },
  on_focus:(input)=>{
    console.log(input)
    console.log('Focus')
    $(input).one('blur', function(){
      SABIAN_SYMBOLS.listern_for_blur_to_remove_symbol_list(input)
    })
  },
  make_symbol_count_data_list:(description)=>{
    var unordered_list = document.createElement('ul')

    console.log(SABIAN_SYMBOLS.symbols_data_obj[description])
    SABIAN_SYMBOLS.symbols_data_obj[description].forEach((item)=>{
      var list_item = document.createElement('li')
      for(let name in item){
        list_item.innerText = `${name} - ${item[name]}`
        unordered_list.append(list_item)

      }

    })
    return unordered_list;
  },

  search_available_symbol_data:(input)=>{
    if (location.hash =="#sabian_symbols"){
      SABIAN_SYMBOLS.set_save_state(false)

    }
    SABIAN_SYMBOLS.remove_list_option()

    // console.log('input')
    console.log(input.value.length)
    console.log(input.value)
    console.log($(input))
    if(input.value.length > 3 ){
      var list = []
      SABIAN_SYMBOLS.symbols_available.forEach((description)=>{
        if (description.indexOf(input.value)!=-1){
          console.log('YES')
          list.push(description)
        }else{
          console.log('NO')
          
        }
      })
      console.log(list)
      var container = document.createElement('div')
      container.id = "filtered-list-container"
      list.forEach((item)=>{
        var div_item = document.createElement('div') 
        $(div_item).on('click', ()=>{
          SABIAN_SYMBOLS.set_description_from_list(div_item, input)
          // SABIAN_SYMBOLS.remove_list_option()

        })



          div_item.classList.add('filtered-list-item')

          $(div_item).text(item)
          $(div_item).attr('data-text',item)

          if (location.hash == "#search_symbols") {
            var count_data = SABIAN_SYMBOLS.make_symbol_count_data_list(item)
            count_data.classList.add('symbol-count-data')
            // console.log('where should i stick this?')
            // console.log(count_data)
            //anchor this elswhere
            // current_search_symbol
            // data_anchor
            $(div_item).append(count_data)

          }
          // console.log(location.hash)

          $(container).append(div_item)
  
      })
      
      console.log('APPEND IT!!')
      if(location.hash == "#search_symbols"){
        $(container).insertAfter($('#data_anchor'))

      }else{
        $(container).insertAfter($(input))

      }

    }
    return
  },
  load_profile:(symbol_data)=>{
    if(!SABIAN_SYMBOLS.save_state) return
    console.log(symbol_data)
    for(let symbol in symbol_data){
      $('input[data-symbol-for="'+symbol+'"]').val(symbol_data[symbol])

    }

  },

  get_all_profiles:()=>{
    $.post('/astrology/get_all_profiles', {}, (resp)=>{
      const _container = $('#profile_list_container')
      console.log(resp)
      if(resp.errorMessage){
        console.log('ERRR+ '+resp.errorMessage)
        App.report_error(_container, 'error message:  '+ resp.errorMessage+' try adding some new profiles')//TODO call to action with animation
      }else if(resp.message){
        let _profile_array = resp.message

        console.log(_profile_array)
        var ordered_array = _profile_array.sort((a, b)=>{
        var A = a.name.toUpperCase().split(' ')[1]
        var B = b.name.toUpperCase().split(' ')[1]
          if (A < B) {return -1}
          if (A > B) {return 1}
          return 0;
        })
        $.each(ordered_array, (i, v)=>{
          let name = v.name;
          let id = v._id
          SABIAN_SYMBOLS.add_new_profile_item_to_list(name, id);
        })
      }
    })
  },
  add_new_profile_item_to_list:(_name, _id)=>{
    const _container = $('#profile_list_container')
    var _list_item = `
        <div data-sabian-profile-item="${_id}">
          <span
            onclick="SABIAN_SYMBOLS.set_current_sabian_symbol_profile('${_id}', '${_name}')" 
            class="profile-item" 
            >${_name}
          </span>
          <button style="display:none;" class="btn btn-danger btn-small" onclick="SABIAN_SYMBOLS.delete_profile('${_id}', '${_name}')">X</button>

        </div>`;
    $(_container).append(_list_item);

  },
  delete_profile:(_id, _name)=>{
    if(!confirm(`Are you sure you want ot perminatly delete ${_name}'s profile`)) return
    $.post('/astrology/delete_profile', {_id}, (resp)=>{
      if(resp=='ok'){
        $('[data-sabian-profile-item="'+_id+'"]').remove()
        toastr.info(`removed ${_name}`)
        SABIAN_SYMBOLS.current_profile=undefined


      }
    })
  },

  set_up_sabian_symbol_edit_view:()=>{
    const _container = $('#sabian_symbol_edit_view')
    const parent_container = $('.sabian_symbol_table_container')[0]

    if(!SABIAN_SYMBOLS.current_profile){
      SABIAN_SYMBOLS.hide_edit_view = true
      $(parent_container).addClass('disabled')
    }
    $.each(SABIAN_SYMBOLS.symbols, (i, v)=>{
      var _tr = `
        <tr>
          <td>${v}</td>
          <td><input 
            class="text-center"
            onfocus="SABIAN_SYMBOLS.on_focus(this)" 
            oninput="SABIAN_SYMBOLS.search_available_symbol_data(this)" 
            type="text" 
            data-symbol-for="${v}"></td>
          <td>E</td>
        </tr>`
        $(_container).append(_tr);
    })
  },
  save_sabian_symbol_profile:()=>{
    SABIAN_SYMBOLS.save_state = true;
    $('#save_sabian_symbols_btn').removeClass('big-red')

    let _name = SABIAN_SYMBOLS.current_profile
    // SABIAN_SYMBOLS.create_new_profile(_name)
    if(!_name)return
      console.log('update the databse wit this data')

      var data = {}
    $.each($('input[data-symbol-for]'), (i, v)=>{
      let symbol = $(v).attr('data-symbol-for')
      let val = $(v).val().trim()
      data[symbol]=val
      // console.log(data)
    })


    console.log(_name);
    SABIAN_SYMBOLS.save_profile(_name, data);
  },

  set_event_handlers:()=>{

    // save btn, minimize btn, profiles list, add new profile
    //save_sabian_symbols_btn
    // minimize_sabian_symbols_btn
    // add_new_sabian_symbol_profile_btn
    //add_new_sabian_symbol_profile_input
    // [data-sabian-profile-item*=""]
    let table_sizes=['1000px','500px', '250px']
    let current_table_state = 2
    let _max = table_sizes.length - 1;
    $('#minimize_sabian_symbols_btn').on('click', ()=>{
      console.log(current_table_state)
      current_table_state++
      current_table_state > _max ? current_table_state = 0:true;
      $('.sabian_symbol_table_container').css({maxHeight:table_sizes[current_table_state]})      

    })
      
    $('#save_sabian_symbols_btn').on('click', ()=>{
      SABIAN_SYMBOLS.save_sabian_symbol_profile()
    })

    $('#add_new_sabian_symbol_profile_btn').on('click', ()=>{
      console.log('get the value of add_new_sabian_symbol_profile_profile')
      let _name = $('#add_new_sabian_symbol_profile_input').val()
      if(!_name)return
      SABIAN_SYMBOLS.create_new_profile(_name)
      $('#add_new_sabian_symbol_profile_input').val('')

    })
  },
  alert_to_save:()=>{
    alert('Save you data first');
    $('#save_sabian_symbols_btn').addClass('big-red')

  },
  list_item_selected:(id)=>{
    var list_items = $('[data-sabian-profile-item]')
    console.log(list_items)
    $.each(list_items, (i, v)=>{
      $(v).removeClass('selected')
      // ?
      //   console.log('yes'):
      //   console.log('no')
    })
    $(`[data-sabian-profile-item="${id}"]`).addClass('selected')
  },
  remove_disable:(el)=>{
    $(el).removeClass('disabled')
  },


  //profiles in the profile colelction
  set_current_sabian_symbol_profile:(id, name)=>{
    if (SABIAN_SYMBOLS.hide_edit_view) SABIAN_SYMBOLS.remove_disable($('.sabian_symbol_table_container')[0]);
    if(!SABIAN_SYMBOLS.save_state) return (SABIAN_SYMBOLS.alert_to_save())
    SABIAN_SYMBOLS.current_profile_id = id
    SABIAN_SYMBOLS.current_profile=name
    SABIAN_SYMBOLS.list_item_selected(id)
    $.post('/astrology/get_sabian_profile', {_id:id}, (resp)=>{
      if(!resp.message){
        App.report_error($('#current-profile-view'), 'resp.errorMessage sabian profile fetch err')
      }else{
        console.log(resp)
        let name = resp.message[0].name
        let data = resp.message[0].symbol_data
        SABIAN_SYMBOLS.current_profile=name
        $('#current-profile-view').text(SABIAN_SYMBOLS.current_profile)
        SABIAN_SYMBOLS.load_profile(data)

      }

    })
  },
  // init_compare_tool:()=>{
  //   let tool = $('.sabian_symbol_compare_tool')[0]
  //   var select = SABIAN_SYMBOLS.utils.make_sabian_symbol_compare_select_box(SABIAN_SYMBOLS.symbols)
  //   $(tool).append(select)

  // },
  utils:{
    make_sabian_symbol_compare_select_box:(sabian_symbol_array)=>{
      let select = $("<select></select>");
      $(select).on('change', (e)=>{
        console.log($(e.target).val())

      })
      sabian_symbol_array.forEach(i=>{
        select.append(`<option>${i}</option>`)
      })
      return select
    },
    get_sabian_symbols_availale_array:()=>{
      $.get('/astrology/get_sabian_symbols_availale_array', (resp)=>{//{symbols_available:array, symbol_count_data:SYMBOL_DATA_OBJ}
        console.log('get_sabian_symbols_availale_array')
        console.log(resp)
        SABIAN_SYMBOLS.symbols_available = resp.symbols_available
        SABIAN_SYMBOLS.symbols_data_obj = resp.symbol_count_data

      })
    }
  }

}




// $(function() {
//   $(window).on('load', function() {
//     console.log('load')
//     SABIAN_SYMBOLS.init();
//   });
// });
