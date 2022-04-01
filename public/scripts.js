// for anime cover preview 

// $(document).ready(function () {
  let currentMousePos = { x: -1, y: -1 }
  $(document).on("mousemove", "[data-preview-image]", function (e) {
    if (e.pageY + $("#preview-image").outerHeight() > ($(window).height() + $(window).scrollTop() - 25)) {
      currentMousePos.y = $(window).height() + $(window).scrollTop() - $("#preview-image").outerHeight() - 25
    } else {
      currentMousePos.y = e.pageY
    }

    if (e.pageX + $("#preview-image").outerWidth() > ($(window).width() + $(window).scrollLeft() - 25)) {
      currentMousePos.x = $(window).width() + $(window).scrollLeft() - $("#preview-image").outerWidth() - 25
    } else {
      currentMousePos.x = e.pageX
    }

    $("#preview-image-overlay").css({ top: currentMousePos.y, left: currentMousePos.x + 10 })
  })

  $(document).on("mouseover", "[data-preview-image]", function (e) {
    $("#preview-image").attr('src', e.target.getAttribute('data-preview-image'))
    $("#preview-image-overlay").show()
  })

  $(document).on("mouseout", "[data-preview-image]", function (e) {
    $("#preview-image-overlay").hide()
  })


  // for getting dynamic data loading, supports animes and episodes 

  // meant for private use
  function paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
      result[key] = value
    }
    return result
  }

  let page = 2
  function dynamicLoad() {
    const urlParams = new URLSearchParams(window.location.search)
    const entries = urlParams.entries()
    const params = paramsToObject(entries)
    const pathname = window.location.pathname

    if (pathname === '/shows') {
      params.page = page
    } else if (pathname.includes('/shows/')) {
      params.id = $('#page-info').attr('anime-id')
      params.locale = $('#page-info').attr('episodes-locale')
      params.page = page
    }

    $('#dynamic-load-button').attr('disabled', true).addClass('cursor-wait').removeClass('cursor-pointer')

    $.ajax({
      url: pathname,
      type: "POST",
      data: JSON.stringify(params),
      contentType: "application/json",
      success: function (data) {
        let html = ""

        if (pathname === '/shows') {
          for (let i = 0; i < data.anime.data.documents.length; i++) {
            html += '<div class="' + $('#anime-div').attr('class') + '">'
            html += '<a href="' + pathname + '/' + data.anime.data.documents[i].id + '" data-preview-image="' + data.anime.data.documents[i].cover_image + '" class="' + $('[data-preview-image]').attr('class') + '">'
            html += data.anime.data.documents[i].titles.en ?? data.anime.data.documents[i].titles[Object.keys(data.anime.data.documents[i].titles)[0]]
            html += '</a></div>'
          }
          $("#anime-container").append(html)
          $("#pagination-message").html(data.anime.message)
        } else if (pathname.includes('/shows/')) {
          for (let i = 0; i < data.episodes.data.documents.length; i++) {
            let episodeID = data.episodes.data.documents[i].id
            let clone = $("#episode-tr").clone(true, true)
            clone.find('[episode-options-menu]').attr('episode-options-menu', episodeID)
            clone.find('[episode-options-menu]').text($('#anime-title').text() + ' - ' + data.episodes.data.documents[i].number)
            clone.find('[menu-container]').attr('id', 'episode-' + episodeID)
            clone.find('[menu-container]').css({ display: 'none' })
            clone.find('[episode-stream-button]').attr('episode-stream-button', episodeID)
            clone.find('[episode-download-link]').attr('href', data.episodes.data.documents[i].video)
            clone.find('[episode-download-link]').attr('id', 'episode-download-link-' + data.episodes.data.documents[i].id)
            clone.find('[video-container]').attr('id', 'video-container-' + episodeID)
            clone.find('[video-container] video').attr('id', 'video-element-' + episodeID)
            clone.find('[video-container] video source').attr('id', 'video-source-' + episodeID)
            html += '<tr id="episode-tr">' + clone.html() + '</tr>'
          }

          $("#episodes-container tbody").append(html)
        }

        // hides the button once there's no info left at the db endpoint
        if (data?.episodes?.data.current_page ?? data?.episodes?.data.last_page)
          if (data?.episodes?.data.current_page === data?.episodes?.data.last_page)
            $('#dynamic-load-button').hide()
        if (data?.anime?.data.current_page && data?.anime?.data.last_page)
          if (data?.anime?.data.current_page === data?.anime?.data.last_page)
            $('#dynamic-load-button').hide()
        
        $('#dynamic-load-button').attr('disabled', false).removeClass('cursor-wait').addClass('cursor-pointer')
        page += 1
      }, error: function (jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown)
      }
    })
  }
  
  // for showing/hiding episodes menu at show anime
  function showOptions() {
    let previouslyOpen = null
    let previouslyVideoOpen = null

    // handles stream/download buttons show/hide
    $(document).on("click", "[episode-options-menu]", function (e) {
      if (previouslyOpen == e.target.getAttribute("episode-options-menu")) {
        $("#video-element-" + previouslyVideoOpen).get(0)?.pause()
        $("#video-container-" + previouslyVideoOpen).hide()
        previouslyVideoOpen = null
        $("#episode-" + previouslyOpen).hide()
        previouslyOpen = null
      } else {
        $("#video-element-" + previouslyVideoOpen).get(0)?.pause()
        $("#video-container-" + previouslyVideoOpen).hide()
        previouslyVideoOpen = null
        $("#episode-" + previouslyOpen).hide()
        $("#episode-" + e.target.getAttribute("episode-options-menu")).show()
        previouslyOpen = e.target.getAttribute("episode-options-menu")
      }

      e.stopImmediatePropagation()
    })

    // handles video preview show/hide and src attribution
    $(document).on("click", "[episode-stream-button]", function (e) {
      let episodeId = e.target.getAttribute("episode-stream-button")
      if (previouslyVideoOpen == episodeId) {
        $("#video-container-" + previouslyVideoOpen).hide()
        previouslyVideoOpen = null
      } else {
        $("#video-container-" + episodeId).show()
        $("#video-container-" + previouslyVideoOpen).hide()
        if (!$("#video-source-" + episodeId).attr('src')) {
          $("#video-source-" + episodeId).attr("src", $('#episode-download-link-' + episodeId).attr('href'))
          $("#video-element-" + episodeId).get(0).load()
        }
        previouslyVideoOpen = episodeId
      }

      e.stopImmediatePropagation()
    })
  }
