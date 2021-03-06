App={
  edit_mode:false,
  current_content:'search_symbols',
  current_data_section:'',
  list_counter:{},
  main_content_sections:['io','sabian_symbols', 'search_symbols'],
  init:()=>{
    console.log('App loading')
    window.location.hash = App.current_content
    return App.setUI();

  },
  setUI:()=>{
    App.utils.hide_all_data_section()
    App.utils.add_data_section_click_events()
    App.utils.init_cool_select()
    App.utils.init_submit_btn()
    App.click_handlers.nav_links()
    App.show_current_content()
  },
  show_current_content:()=>{
    $.each(App.main_content_sections, (i,v)=>{
      console.log(v)
      $('#'+v).addClass('hide')
    })
    $('#'+App.current_content).removeClass('hide')

  },
  main_content:(content)=>{
    var mc = $('.main-content')[0]
    $(mc).html('')
  },
  verify_full_obj:(current_data_section)=>{
    var data_inputs = $('[name*="'+current_data_section+'"]')
    console.log(data_inputs)
    var _tmp = {}
    $.each(data_inputs, (i, v)=>{
      if(!$(v).val()){
        _tmp[i]=v
      }
    })
    console.log(_tmp)
    if(Object.keys(_tmp) <1){
      console.log('this is a full obj')
      return 'good'
    }else{
      console.log('this needs more data')
      return _tmp
    }

  },
  utils:{
    get_all_data:()=>{
      var data = {}
      $.each($('[name]'), (i, v)=>{
        var key = ($(v).attr('name'))
        var value = ($(v).val())
        if(value != '') data[key]=value;
      })
      console.log(data)
      return(data)
    },
    init_submit_btn:()=>{
      $('.submit-button').each((index, btn)=>{
        btn.addEventListener('click', () => {
          var _data = App.verify_full_obj(App.current_data_section)
          if (_data == "good") {
            var data = App.utils.get_all_data()
            $.post("/input", data, (resp) => {
              data['_id'] = resp.message.insertedIds[0]
              App.utils.create_message_result(data, $('[data-total-output="' + App.current_data_section + '"]'), App.current_data_section, ++App.list_counter[App.current_data_section]);
              toastr.success(App.current_data_section.split('-').join(' '), "Submited succesfully")
              console.log(resp)
              $.each($('[name="' + App.current_data_section + '-description"]'), (i, v) => {
                $(v).val('')
                // $(v).removeClass('is-set')
                // $(v).addClass('not-set')
              })

            })
          } else {
            console.log(_data)
            App.utils.apply_error_notification(_data)
          }

        })


      })
    },
    apply_error_notification:(_el_obj)=>{
      console.log('these eles need to be errorified')
      console.log(_el_obj)
      $.each(_el_obj, (i, v)=>{
        handle_animation(v, 'shake')
        toastr.error('Data Appears to be blank')
      })

    },
    init_cool_select:()=>{
      $.each($('.cool-select'), (i, v)=>{
        $(v).addClass('not-set')
        $(v).on('change', (e)=>{
          console.log('change')
          var tar = e.target
          var val = e.target.value
          var name = $(tar).attr("name")
          var _found_data
          if(val==''){
            $(tar).addClass('not-set')
            $(tar).removeClass('is-set')
            $('[data-output="'+name+'"]').text('') 

          }else{
            $(tar).removeClass('not-set')
            $(tar).addClass('is-set')
            console.log(name)
            $.post('/output', {[name]:val}, (data)=>{
              console.log(data)
              if(data.errorMessage != undefined){
                console.log("no")
                _found_data = 0

              }else if(data.message != undefined){
                console.log('yes');
                _found_data = data.message.length;


              }
              tar.blur()

              
              $('[data-output="'+name+'"]').text(_found_data);
              App.utils.get_the_group_select_data(name);

            })
          }
        })
        // $(v).on('input', (e)=>{
        //   console.log('input')
        //   var tar = e.target
        //   // tar.blur()
        //   // tar.focus()
        //   // tar.blur()

        // })


      })
    },
    get_the_group_select_data:(_name)=>{
      console.log('get get_the_group_select_data called')
      console.log(_name)
      var _name = _name.split('-');
      _name.pop();
      _name = _name.join('-');
      console.log(_name);

      var select_items = $('select[name*="'+_name+'"]')
      var count = select_items.length
      var el = $('[data-total-output="'+_name+'"]')
      console.log(_name)
      var data_obj = {}
      $.each(select_items, (i, v)=>{
        var key = $(v).attr("name")
        var val = $(v).val()
        if(val=='') return
          data_obj[key]=val
        if(Object.keys(data_obj).length == count){
          console.log('we got a full obj');
          console.log(data_obj);
          $.post('/output', data_obj, (resp)=>{
            console.log('/output data returned, better clear what already in there.....');
            $(el).html('')
            console.log(resp);
            App.utils.stop_spinner(el);
            App.utils.write_results(el, resp, _name);
            
          })
        }else{
          console.log('not full yet');
          console.log("count = "+count);
          console.log("were only at  : "+Object.keys(data_obj).length)
          //start spinner?
          App.utils.start_spinner(el);
        }
      })
    },
    start_spinner:(el)=>{
      if(el.children().length > 0) return
      $(el).append('<div id="block-spinner"></div>');
    },
    stop_spinner:(el)=>{
      console.log('stop spinner');
      $('#block-spinner').remove();
    },
    write_results:(el, resp_obj, _name)=>{
      console.log(el);
      console.log(resp_obj);
      var _found_data;
      if(resp_obj.message != undefined){
        console.log('got a message');
        _found_data = resp_obj.message.length;
        var messages = resp_obj.message;
        console.log(messages)
        for(let x = 0 ; x < messages.length ; x++){
          console.log(messages.length)
          console.log(x)
          App.list_counter[_name]=x

          console.log(messages[x]);
          App.utils.create_message_result(messages[x], el, _name, x);
        }
      }else if(resp_obj.errorMessage != undefined){
        console.log('got an error message');
        _found_data = 0;
        App.list_counter[_name]=0
        // $(el).text(': No results');
      }else{
        console.log('unexpected results');
      }
      console.log(_found_data)

    },
    create_message_result:(msg, el, _name, count)=>{
      $(el).append(`
        <tr>
          <td>${count}</td>
          <td data-description='${msg._id}'>${msg[_name+"-description"]}</td>
          <td><button onclick="App.edit_description(this) "type="button" class="btn btn-info btn-big"data-ID="${msg._id}"><span class="fa fa-edit"></span></button></td>
          <td><button onclick="App.delete_description(this) "type="button" class="btn btn-danger btn-big"data-ID="${msg._id}"><span class="fa fa-trash"></span></button></td>
        </tr>`)
      // $(el).append(`<li>${"-description"} <span data-ID="${msg['_id']}">X</span></li>`)
    },
    hide_all_data_section:()=>{
      $.each($('[data-section]'),(i, v)=>{$(v).css({display:'none'})})
    },
    add_data_section_click_events:()=>{
      $.each($('.clickaction_open'),(i, v)=>{$(v).on('click', (e)=>{
        var data_section = $(e.target).text()
        // console.log('DATA SECTIO ISSS '+data_section)
        data_section_tag = data_section.split(' ').join('-')
        App.utils.hide_all_data_section()
        App.current_data_section = data_section_tag
        $('[data-section="'+data_section+'"]').css({display:"flex", opacity:"1"})
      })})

    }
  },
  click_handlers:{
    nav_links:()=>{
      $.each($('.nav-item'), (i, v)=>{
        $(v).on('click', (e)=>{
          // console.log(e.target)
          var _tar = e.target
          var _nav = $(_tar).attr('data-nav')
          console.log(_nav)
          $('#'+App.current_content).addClass('hide')
          $('#'+_nav).removeClass('hide')
          App.current_content = _nav

        })
      })
    }
  },
  edit_description:(e)=>{
    if(App.edit_mode)return
    App.edit_mode=true
    var _id = $(e).attr('data-ID')
    console.log(e)
    console.log(_id)
    var text_area = $(`[data-description='${_id}']`)
    var description = $(text_area).html()
    var textarea = document.createElement('textarea')
    textarea.value = description
    $(text_area).html('')
    $(text_area).append(textarea)
    textarea.focus()
    $(textarea).on('blur', ()=>{
      console.log('blur')
      var new_desc = $(textarea).val()
      $(text_area).html('')
      $(text_area).html(new_desc)
      App.edit_mode=false
      console.log(App.current_data_section)
      var data = {id:_id, data:new_desc, section:App.current_data_section}
      $.post("/input_edit", data, (resp)=>{
        console.log(resp)
        if (resp.err){
          toastr.error(resp.err)
        }else{
          toastr.info(resp.message)
        }
      })


    })

    console.log(description)
  },
  delete_description:(e)=>{
    if(confirm('Are you sure you want to delete this item?')){
      console.log('delete')
      console.log(e)
      console.log(e.parent)
      var _id = $(e).attr('data-ID')
      $.post('/delete_description', {_id} , (resp)=>{
        console.log(resp)
        if (resp.err){
          toastr.error("There was an error, please contact Dave")
        }else{
          toastr.info('Description deleted')
          $(e).parent().parent().remove()

        }

      })
    }

  },
  report_error:(_container, error_message)=>{
    toastr.warning(error_message)
    if(_container && error_message){
      $(_container).append(error_message)

    }

  }

}


window.addEventListener("load", function(event) {
  console.log("All resources finished loading!");
  SABIAN_SYMBOLS.init();
  SEARCH_SYMBOLS_PAGE.init();

  App.init();
});


function test(){
  var img = $('img')[0]
  img.styles.width="50%"
}

function handle_animation(element, animation){
  function remove_animation_class(){
    console.log('animation over')
    element.classList.remove('animated', animation)
    element.removeEventListener('animationend', remove_animation_class)
  }
  
  element.addEventListener('animationend', remove_animation_class)

  element.classList.add('animated', animation)
}

