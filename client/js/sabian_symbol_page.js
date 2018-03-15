SABIAN_SYMBOLS = {
  current_profile:'',
  symbols:['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Descendant', 'Midheaven', 'Nadir', 'North Node', 'South Node'],
  sabian_symbol_compared_values:[],
  init:()=>{
    console.log('Sabin symbols loading')
    SABIAN_SYMBOLS.get_all_profiles()
    SABIAN_SYMBOLS.set_up_sabian_symbol_edit_view();
    SABIAN_SYMBOLS.set_event_handlers();
    SABIAN_SYMBOLS.init_compare_tool();

  },
  create_new_profile:(_name)=>{
    console.log(_name)
    //here we will call the API, and wait for response then add run add_new_profile_item_to_list
    $.post('/astrology/add_new_sabian_symbol_profile', {name:_name}, (resp)=>{
      console.log(resp)
      if(resp.message){
        let _id = resp.message.insertedIds[0];
        SABIAN_SYMBOLS.add_new_profile_item_to_list(_name, _id)
      }
    })
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
        $.each(_profile_array, (i, v)=>{
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
          <p
            onclick="SABIAN_SYMBOLS.set_current_sabian_symbol_profile('${_id}')" 
            class="profile-item" 
            >${_name}
          </p>
          <button class="button" onclick=SABIAN_SYMBOLS.delete_profile('${_id}')>X</button>
        </div>`;
    $(_container).append(_list_item);

  },
  delete_profile:(_id)=>{
    $.post('/astrology/delete_profile', {_id}, (resp)=>{
      if(resp=='ok'){
        $('[data-sabian-profile-item="'+_id+'"]').remove()

      }
    })
  },

  set_up_sabian_symbol_edit_view:()=>{
    const _container = $('#sabian_symbol_edit_view')
    $.each(SABIAN_SYMBOLS.symbols, (i, v)=>{
      var _tr = `
        <tr>
          <td>${v}</td>
          <td><input type="text" data-symbol-for="${v}"></td>
          <td>E</td>
        </tr>`
        $(_container).append(_tr);
    })
  },

  set_event_handlers:()=>{
    // save btn, minimize btn, profiles list, add new profile
    //save_sabian_symbols_btn
    // minimize_sabian_symbols_btn
    // add_new_sabian_symbol_profile_btn
    //add_new_sabian_symbol_profile_input
    // [data-sabian-profile-item*=""]
    let table_sizes=['1000px','400px', '100px']
    let current_table_state = 2
    let _max = table_sizes.length - 1;
    $('#minimize_sabian_symbols_btn').on('click', ()=>{
      console.log(current_table_state)
      current_table_state++
      current_table_state > _max ? current_table_state = 0:true;
      $('.sabian_symbol_table_container').css({maxHeight:table_sizes[current_table_state]})      

    })
      
    $('#add_new_sabian_symbol_profile_btn').on('click', ()=>{
      console.log('get the value of add_new_sabian_symbol_profile_profile')
      let _name = $('#add_new_sabian_symbol_profile_input').val()
      SABIAN_SYMBOLS.create_new_profile(_name)
    })
  },


  //profiles in the profile colelction
  set_current_sabian_symbol_profile:(id)=>{

    $.post('/astrology/get_sabian_profile', {_id:id}, (resp)=>{
      if(!resp.message){
        App.report_error($('#current-profile-view'), 'resp.errorMessage sabian profile fetch err')
      }else{
        console.log(resp)
        let name = resp.message[0].name
        SABIAN_SYMBOLS.current_profile=name
        $('#current-profile-view').text(SABIAN_SYMBOLS.current_profile)

      }

    })
  },
  init_compare_tool:()=>{
    let tool = $('.sabian_symbol_compare_tool')[0]
    var select = SABIAN_SYMBOLS.utils.make_sabian_symbol_compare_select_box(SABIAN_SYMBOLS.symbols)
    $(tool).append(select)

  },
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
    }
  }

}




// $(function() {
//   $(window).on('load', function() {
//     console.log('load')
//     SABIAN_SYMBOLS.init();
//   });
// });
