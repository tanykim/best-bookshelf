'use strict';

//get floor/ceiling range
function getRange(arr, by) {
  return [Math.floor(_.min(arr) / by) * by, Math.ceil(_.max(arr) / by) * by];
}

//calculate when to divide books
function getDivider(datum, option) {
  let val = datum[option];
  //get divider labels
  let label = val;
  if (option === 'year_desc') {
    label = -val;
  } else if (option === 'first_name' || option === 'last_name') {
    label = val.charAt(0);
  } else if (option === 'age_asc') {
    if (val > 0) {
      label = (Math.floor(Math.abs(val) / 10) * 10) + '+';
    } else if (val === 0) {
      label = 'Unknown';
    } else {
      label = 'After death';
    }
  } else if (option === 'age_desc') {
    if (val < 0) {
      label = (Math.floor(Math.abs(val) / 10) * 10) + '+';
    } else if (val === 0) {
      label = 'Unknown';
    } else {
      label = 'After death';
    }
  } else if (option === 'pages_asc' || option === 'pages_desc') {
    label = (Math.floor(Math.abs(val) / 100) * 100).toLocaleString() + '+';
  } else if (option === 'rating_asc' || option === 'rating_desc') {
    label = (Math.floor((Math.floor(Math.abs(val) * 10) * 2) / 10) / 2) + '+';
  } else if (option === 'rating_count_asc' || option === 'rating_count_desc') {
    label = Math.abs(val) < 10000 ? '<10K' : (Math.floor(Math.abs(val) / 10000) * 10000 / 1000 + 'K+');
  } else if (option === 'is_not_bestseller') {
    label = !val ? 'NYT Best seller' : 'Not Best Seller';
  } else if (option === 'is_english') {
    label = val ? 'English': 'Translated';
  } else if (option === 'title') {
    label = _.isNaN(+val.charAt(0)) ? val.charAt(0) : '#';
  } else if (option === 'title_desc' || option === 'title_asc') {
    label = (Math.floor(Math.abs(val) / 10) * 10).toLocaleString() + '+';
  }
  return label;
}

//draw stars
function starPoints(cX, cY, arms, oR, iR) {
  let results = '';
  const angle = Math.PI / arms;
  for (let i = 0; i < 2 * arms; i++) {
      var r = (i & 1) == 0 ? oR : iR;
      var currX = cX + Math.cos(i * angle) * r;
      var currY = cY + Math.sin(i * angle) * r;
      if (i == 0) {
        results = `${currX}, ${currY}`;
      } else {
        results += `, ${currX}, ${currY}`;
      }
   }
   return results;
}

//search
function getSearchedText(str, entered) {
  let result = str;
  const index = str.toLowerCase().indexOf(entered);
  if (index > -1) {
    result = `${str.substring(0, index)}<i>${str.substr(index, entered.length)}</i>${str.substring(index + entered.length, str.length)}`;
  }
  return result;
}

//show modal
function showModal(d, i, count, list, entered) {
  //control prev, next bottons
  d3.select('.js-modal-prev').classed('is-hidden', i <= 0);
  if (i > 0) {
    d3.select('.js-modal-prev').on('click', () => { showModal(list[i - 1], i - 1, count, list, entered) });
  }
  d3.select('.js-modal-next').classed('is-hidden', (i < count - 1 ? false : true));
  if (i < count - 1) {
    d3.select('.js-modal-next').on('click', () => { showModal(list[i + 1], i + 1, count, list, entered) });
  }

  //show book elements
  d3.select('.js-d-genre').classed(`tag-${d.genre}`, true).classed(`tag-${d.genre === 'Fiction' ? 'Nonfiction' : 'Fiction'}`, false);
  d3.select('.js-modal-count').html(`${entered ? `Searched by <strong>${entered}</strong>, ` : ''}${i + 1}/${count}`);
  d3.select('.js-book-image').attr('src', d.book.image_url).attr('alt', d.title);
  d3.select('.js-d-title-link').attr('href', d.book.link);
  let title = d.title.toUpperCase();
  let subtitle = 'N/A';
  const colon = d.title.indexOf(':');
  if (colon > -1) {
    title = d.title.slice(0, colon).toUpperCase();
    subtitle = d.title.slice(colon + 2, d.title.length);
  }
  let bestseller = 'N/A';
  if (!_.isEmpty(d.book.seller)) {
    let bs = '';
    _.each(d.book.seller, (v, k) => {
      const rank = _.max(v.map((d) => d.rank));
      const dates = _.filter(v, (d) => d.rank === rank).map((d) => d.date).join('/');
      const weeks = _.max(v.map((d) => d.weeks));
      bs += `<li><i>#${rank}</i> in <i>${k}</i>: ${dates}${weeks > 1 ? ` (${weeks} weeks on the list)` : ''}</li>`;
    })
    bestseller = bs;
  }
  const bookInfo = {
    title,
    subtitle,
    author: d.book.author_names,
    translator: d.book.translator || 'N/A',
    editor: d.book.editor || 'N/A',
    year: d.year_asc,
    genre: d.genre,
    pages: d.book.pages,
    publication_date: d.book.publication_date,
    publisher: d.book.publisher,
    bestseller: bestseller,
    rating_avg: d.rating_asc.toFixed(2),
    rating_count: d.rating_count_asc.toLocaleString(),
    original_publication_date: d.book.original_publication_date
  };
  _.each(bookInfo, (v, k) => {
    if (v) {
      if (k === 'translator' || k === 'editor' || k === 'subtitle' || k === 'bestseller' || k === 'original_publication_date') {
        d3.select(`.js-d-${k}-wrapper`).classed('is-hidden', v === 'N/A');
      }
      d3.select(`.js-d-${k}`).html(v);
    }
  });
  //authors info
  const wrapper = d3.select('#modal-authors').html('');
  _.each(_.compact(d.book.author_ids), (id) => {
    const author = data.authors[id];
    const media = wrapper.append('div').attr('class', 'media media-author');
    media.append('div')
        .attr('class', 'media-left')
      .append('figure')
        .attr('class', 'image')
      .append('img')
        .attr('src', author.image_url)
        .attr('alt', author.name);
    media.append('div')
        .attr('id', `author-info-${id}`)
        .attr('class', 'media-content')
      .append('p')
        .attr('class', 'title is-5')
        .html(`<span>${author.name}</span> <a target="_blank" href="${author.link}"><span class="modal-link"></span></a>`);
    const authorInfo = d3.select(`#author-info-${id}`)
      .append('div')
        .attr('class', 'info-elm');
    const age = d.age_asc === -10 ?
      'Published after death' :
      (d.age_asc > 0 ?
        `${Math.floor(d.age_asc)} years old at original publication` :
        'N/A');
    if (age !== 'N/A') {
      authorInfo.append('p').html(`<span class="info">${age}</span>`)
    }
    if (author.birth_date_simple !== 'N/A') {
      authorInfo.append('p').html(`Born <span class="info">${author.birth_date_simple}</span>`)
    }
    if (author.death_date_simple !== 'N/A') {
      authorInfo.append('p').html(`Died <span class="info">${author.death_date_simple}</span>`)
    }
  });
  const authorsInfo = d.book.author_ids.map((id) => data.authors[id]);
}

function getShelfWidth() {
  return Math.max(document.getElementById('shelf').clientWidth, 700)
}
//put all javascript code in one function
(() => {
  const books = _.sortBy(data.books, ['year_desc', 'genre']);

  //add text in headline
  d3.select('#headline-count').text(books.length);
  d3.select('#headline-year-start').text(books[books.length - 1].year_asc);
  d3.select('#headline-year-end').text(books[0].year_asc);
  d3.select('#generation-date').text(data.generation_date);

  //get wrapper width
  let divW = getShelfWidth();
  /* gap is drawn in svg, side are drawn in div style (background & border)
  =========== gap
  | story H |
  =========== gap
  | story H |
  =========== gap
  */
  //set range
  const storyH = 100; //same as maximum book height
  const storyGap = 40; //height of gap
  const bookWRange = [10, 60]; //book thickness
  const bookHRange = [60, storyH]; //book height range

  //put two Gs in the entire shelf, one for shelf bg, one for other elements
  const shelfG = d3.select('#shelf-svg').attr('width', divW).append('g');
  const g = d3.select('#shelf-svg').append('g');

  //dimensions for each book
  const pages = books.map((d) => d.book.pages);
  const pageRange = getRange(pages, 100);
  const ages = _.filter(books.map((d) => d.age_asc), (d) => d > 0);
  const ageRange = getRange(ages, 10);
  const bookW = d3.scaleLinear().domain(pageRange).range(bookWRange); //page
  const bookH = d3.scaleLinear().domain([3, 5]).range(bookHRange); //rating
  const middleH = d3.scaleLinear().domain(ageRange).range([10, bookHRange[0]]); //age

  //put legend of first level (id) and 2nd level
  const putLegend0 = (text, count, accW, accS, isInitial, gap) => {
    //hide labels first after sorting option is changed
    let triangle = 5;
    let pX = accW;
    let pY = (accS - 1) * (storyH + storyGap);
    let wrapper = g.append('g')
      .attr('transform', `translate(${pX}, ${pY})`)
      .attr('class', `js-legends${isInitial ? '' : ' is-hidden'}`)
    wrapper.append('rect')
      .attr('x', -gap + 5)
      .attr('y', storyGap)
      .attr('width', gap - 5.5)
      .attr('height', storyH)
      .attr('class', 'legend-0-bg');
    wrapper.append('text')
      .attr('x', -gap + 5)
      .attr('y', storyGap - triangle * 3)
      .attr('dy', -4)
      .text(text)
      .attr('class', 'legend-0');
    wrapper.append('text')
      .attr('x', -gap + 5 + triangle * 1.2 + 4)
      .attr('y', storyGap - triangle - 2)
      .attr('class', 'legend-0-count')
      .attr('id', `legend-0-${count}`);
    //triangle
    g.append('path')
      .attr('d', `M${pX - gap + 5} ${pY + storyGap - triangle * 2 - 2} l ${triangle * 1.2} ${triangle} l ${-triangle * 1.2} ${triangle} z`)
      .attr('class', `legend-arrow js-legends${isInitial ? '' : ' is-hidden'}`)
  };
  const putLegend1 = (text, count, accW, accS, isInitial, gap) => {
    let pX = accW;
    let pY = accS * (storyH + storyGap) - storyH;
    let wrapper = g.append('g')
      .attr('transform', `translate(${pX}, ${pY})`)
      .attr('class', `js-legends${isInitial ? '' : ' is-hidden'}`);
    wrapper.append('rect')
      .attr('x', -gap + 0.5)
      .attr('y', 0)
      .attr('width', gap - 1)
      .attr('height', storyH)
      .attr('class', 'legend-1-bg');
    wrapper.append('text')
      .attr('x', -4)
      .attr('y', 4)
      .text(text)
      .attr('transform', `rotate(90, -4, 4)`)
      .attr('class', 'legend-1');
    wrapper.append('text')
      .attr('x', -4)
      .attr('y', storyH)
      .attr('dy', -4)
      .attr('class', 'legend-1-count')
      .attr('id', `legend-1-${count}`);
  };

  //sort options
  let sortOptions = ['year_desc', 'genre'];

  //get new positions for the books when option is changed & put legends
  function getDimensions(sortedBooks, isInitial) {
    //remove all legends first
    d3.selectAll('.js-legends').remove();
    d3.selectAll('.js-shelves').remove();
    let prevVals = _.map(sortOptions, (o) => getDivider(sortedBooks[0], o));
    let edge = 10;
    let gap0 = 40; //first level gap
    let gap1 = 28; //second level gap
    let accW = gap0; //accumulated width
    let accS = 1; //accumultated number of strories
    let dimensions = [];
    let counts = [0, 0]; //count of books in the current label
    let isNewLabels = [true, true]; //check if the books are divided
    let labelCounts = [0, 0]; //counts of each label, used for id
    _.each(sortedBooks, (d, i) => {
      const w = bookW(d.book.pages); //book width
      const h = bookH(d.rating_asc); //book height
      const dividers = sortOptions.map((o) => getDivider(d, o)); //get labels at the dividing postions
      //check with the previous vals, then decide to divide or not
      if (dividers[0] !== prevVals[0]) {
        accW += gap0;
        isNewLabels[0] = true;
      } else if (dividers[1] !== prevVals[1]){
        accW += gap1;
        isNewLabels[1] = true;
      }
      //check if the accmulated books' width is larger than the shelf width
      if (accW + w > divW) {
        accS++;
        if (_.isEqual(prevVals, dividers)) {
          accW = 0;
        } else if (prevVals[0] !== dividers[0]) {
          accW = gap0;
        } else if (prevVals.length > 1 && prevVals[1] !== dividers[1]) {
          accW = gap1;
        }
      }
      //add dmensions
      dimensions.push({
        x: accW,
        y: (storyH + storyGap) * accS - h,
        bookId: d.book.id //needed for d3 selection
      })
      //update prev vals
      counts[0]++;
      counts[1]++;
      //put the first level label
      if (isNewLabels[0]) {
        putLegend0(dividers[0], labelCounts[0], accW, accS, isInitial, gap0);
        //update count for the previous values
        d3.select(`#legend-0-${labelCounts[0] - 1}`).text(counts[0]);
        counts[0] = 0;
        labelCounts[0]++;
      }
      //put the second level only for two sorting options
      if ((isNewLabels[0] || isNewLabels[1]) && sortOptions.length === 2) {
        putLegend1(dividers[1], labelCounts[1], accW, accS, isInitial, gap1);
        d3.select(`#legend-1-${labelCounts[1] - 1}`).text(counts[1]);
        counts[1] = 0;
        labelCounts[1]++;
      }
      //update the last labels; count
      if (i === sortedBooks.length - 1) {
        d3.select(`#legend-0-${labelCounts[0] - 1}`).text(counts[0] + 1);
        d3.select(`#legend-1-${labelCounts[1] - 1}`).text(counts[1] + 1);
      }
      //add width, update before the next iteration
      accW += (w + 0);
      prevVals = dividers;
      isNewLabels = [false, false];
    });

    //set the wrapper height to fit
    d3.select('#shelf-svg').attr('height', accS * (storyGap + storyH) + storyGap);
    // put story gap
    _.each(_.range(accS + 1), (i) => {
      shelfG.append('rect')
        .attr('x', 0)
        .attr('y', i * (storyH + storyGap))
        .attr('width', divW)
        .attr('height', storyGap)
        .attr('class', 'shelf-gap js-shelves')
    });
    return dimensions;
  }

  function resizeShelf() {
    const sortedBooks = _.sortBy(books, sortOptions);
    const dimensions = getDimensions(sortedBooks, false);
    //disable the sorting options
    d3.selectAll('select').attr('disabled', 'disabled');
    //move books
    _.each(dimensions, (d, i) => {
      const bg = d3.select(`#book-${d.bookId}`);
      //move horizontally first, then move vertically
      const currentY = +bg.attr('prev-y');
      bg.attr('prev-y', d.y)
        .transition()
          .attr('transform', `translate(${d.x}, ${currentY})`)
          .duration(1000)
          .delay(800 * Math.random())
          .on('end', function() {
            d3.select(this)
              .transition()
              .duration(800)
              .delay(600 * Math.random())
              .attr('transform', `translate(${d.x}, ${d.y})`)
              .on('end', () => {
                //when animation ends, show the legends
                d3.selectAll('.js-legends').classed('is-hidden', false);
                //enable back the sorting options
                _.delay(() => { d3.selectAll('select').attr('disabled', null) }, 1400);
              });
          });
      bg.on('click', () => {
        d3.select('#modal').classed('is-active', true);
        showModal(sortedBooks[i], i, dimensions.length, sortedBooks);
      });
    });
  }

  //sort books
  function sortBooks(option, id) {
    //update global sort option and sort the original books
    sortOptions[+id] = option;
    resizeShelf();
  }

  /**********
  //draw book
  ***********/
  const dimensions = getDimensions(books, true);
  function getUpPos(elm, isUp) {
    //get current transform value, then update y pos
    const currP = elm.attr('transform');
    const splitted = currP.split(', ');
    const currY = splitted[1].slice(0, splitted[1].length - 1);
    return `${splitted[0]}, ${currY - (isUp ? 10 : -10)})`
  }
  g.selectAll('.js-books')
    .data(books)
      .enter()
    .append('g') //book wrapper
      .attr('transform', (d, i) => `translate(${dimensions[i].x}, ${dimensions[i].y})`)
      .attr('title', (d) => {
        let title = `<strong>${d.title.toUpperCase()}</strong>`;
        const colon = d.title.indexOf(':');
        if (colon > -1) {
          title = `<strong>${d.title.slice(0, colon).toUpperCase()}</strong><br/>${d.title.slice(colon + 2, d.title.length)}`
        }
        return `${title}<div><div class="author">by <strong>${d.book.author_names}</strong></div></div>`;
      })
      .attr('class', 'js-books')
      .attr('id', (d) => `book-${d.book.id}`)
      .attr('prev-y', (d, i) => dimensions[i].y)
      .on('mouseover', function(d) {
        if ('ontouchstart' in document) {
          return false;
        }
        //effect of book being picked up
        d3.select(`#book-${d.book.id}`)
          .attr('transform', getUpPos(d3.select(this), true));
        //tippy
        tippy(`#book-${d.book.id}`, {
          arrow: true,
          duration: 0,
          size: 'small',
          theme: `book-${d.genre}`
        });
      })
      .on('mouseout', function(d) {
        if ('ontouchstart' in document) {
          return false;
        }
        d3.select(`#book-${d.book.id}`)
          .attr('transform', getUpPos(d3.select(this), false));
      })
      .on('click', (d, i) => {
        d3.select('#modal').classed('is-active', true);
        showModal(d, i, books.length, books);
      })
    .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d) => bookW(d.book.pages))
      .attr('height', (d) => bookH(d.rating_asc))
      .attr('rx', 1)
      .attr('ry', 1)
      .attr('id', (d) => `book-rect-${d.book.id}`)
      .attr('class', (d) => `genre-${d.genre} book-${d.gender}`);
  //draw age overay
  _.each(_.filter(books, (d) => d.age_asc > 0), (d) => {
    d3.select(`#book-${d.book.id}`)
      .append('rect')
      .attr('x', 0)
      .attr('y', bookH(d.rating_asc) - middleH(d.age_asc))
      .attr('width', bookW(d.book.pages))
      .attr('height', middleH(d.age_asc))
      .attr('class', 'age-overlay')
  });
  //mark bestseller
  _.each(_.filter(books, (d) => d.is_bestseller), (d) => { //filter only best sellers
    d3.select(`#book-${d.book.id}`)
      .append('polygon')
      .attr('points', starPoints(
        bookW(d.book.pages) / 2,
        bookH(d.rating_asc) - bookWRange[0] * 1.2,
        9,
        bookWRange[0] * 0.50,
        bookWRange[0] * 0.66
      ))
      .attr('class', 'bestseller')
  });
  //show non-english books
  _.each(_.filter(books, (d) => !d.is_english), (d) => { //filter non english books
    d3.select(`#book-${d.book.id}`)
      .append('path')
      .attr('d', `M 0 0 h ${bookWRange[0]} l -${bookWRange[0]} ${bookWRange[0]} z`)
      .attr('class', 'translated')
  });
  //modal close
  d3.select('#modal-close').on('click', () => {
    d3.select('#modal').classed('is-active', false);
  })

  //search
  let selectedId = -1;
  function resetSearch() {
    selectedId = -1;
    d3.selectAll('.js-search-elm').classed('is-hidden', true);
    d3.select('#search-result').html('');
  }
  function triggerModal(obj, i, count, list, entered) {
    d3.select('#modal').classed('is-active', true);
    showModal(obj, i, count, list, entered);
    resetSearch();
  }
  document.getElementById('search-input').addEventListener('keyup', function(d) {
    //check from minimum 3 letters
    if (this.value.length > 2) {
      const entered = this.value.trim().toLowerCase();
      const filtered = _.filter(books, (d) => {
        return d.title.toLowerCase().indexOf(entered) > -1 ||
          d.book.author_names.toLowerCase().indexOf(entered) > -1 ||
          d.book.publisher.toLowerCase().indexOf(entered) > -1;
      });
      //show only books exists by the typed letters
      if (filtered.length > 0) {
        const bookIds = filtered.map((d) => d.book.id);
        const searched = filtered.map((d, i) => {
          let titleFormatted = d.title;
          const splitted = d.title.split(':')
          if (splitted.length > 1) {
            titleFormatted = `${splitted[0].toUpperCase()}:${splitted[1]}`;
          }
          let title = getSearchedText(titleFormatted, entered);
          let name = getSearchedText(d.book.author_names, entered);
          let publisher = getSearchedText(d.book.publisher, entered);
          return `<li class="item js-search-list js-search-${i}" search-id="${i}" id="search-${i}">${title}<br/>by ${name}, ${publisher}</li>`
        });
        //add list to <ul>
        d3.selectAll('.js-search-elm').classed('is-hidden', false);
        d3.select('#search-result')
          .html(`<li class="count" id="search-count"><i>${searched.length}</i> book${searched.length > 1 ? 's' : ''} found</a></li>${searched.join(' ')}`);
        //height of the count line
        const countH = document.getElementById('search-count').clientHeight;
        //down arrow pressed
        if (d.keyCode === 40) {
          selectedId = selectedId < searched.length - 1 ? selectedId + 1 : 0;
          //when getting back to the first item
          if (selectedId === 0) {
            document.getElementById('search-result').scrollTop = 0;
          } else {
            let prevH = countH;
            for (let i = 0; i <= selectedId; i++) {
              prevH += document.getElementById(`search-${i}`).clientHeight;
            }
            //30 is the height of <ul>, if it's bigger -> scroll
            if (prevH > 300) {
              document.getElementById('search-result').scrollTop = prevH - 300 + countH;
            }
          }
        //up arrow pressed
        } else if (d.keyCode === 38) {
          selectedId = selectedId > 0 ? selectedId - 1 : searched.length - 1;
          const scrollT = document.getElementById('search-result').scrollTop;
          let prevH = 0;
          for (let i = 0; i <= selectedId; i++) {
            prevH += document.getElementById(`search-${i}`).clientHeight;
          }
          //shen hitting the last item after loop
          if (selectedId === searched.length - 1) {
            document.getElementById('search-result').scrollTop = prevH;
          } else if (prevH < scrollT) {
            document.getElementById('search-result').scrollTop = prevH - 300 + countH;
          }
        //enter pressed
        } else if (d.keyCode === 13 && selectedId > -1) {
          triggerModal(filtered[selectedId], selectedId, filtered.length, filtered, entered);
          this.value = '';
        }
        d3.selectAll('.js-search-list').classed('item-hover', false);
        d3.select(`.js-search-${selectedId}`).classed('item-hover', true);
        //mouse interaction
        d3.selectAll('.js-search-list')
          .on('mouseover', function() {
            d3.select(this).classed('item-hover', true);
            selectedId = +d3.select(this).attr('search-id');
          })
          .on('mouseout', function() {
            d3.select(this).classed('item-hover', false);
          })
          .on('click', function() {
            let id = +d3.select(this).attr('search-id');
            triggerModal(filtered[id], id, filtered.length, filtered);
            document.getElementById('search-input').value = '';
          })
        d3.select('.js-search-close')
          .on('click', () => {
            this.value = '';
            resetSearch();
          });
      } else {
        resetSearch();
      }
    } else {
      resetSearch();
    }
  });

  //sort
  document.getElementById('sort-0').addEventListener('change', (d) => {
    const option = d.target.value;
    //hide second options for selected options
    //options that comes with the second option
    const withSecond = ['year_asc', 'year_desc', 'gender', 'genre', 'is_not_bestseller', 'is_english'];
    let isHidden = false;
    if (withSecond.indexOf(option) === -1) { //options without second
      isHidden = true;
      sortOptions = []; //empty sort options first
    } else {
      //set the second options back, when a withSecond option is selected
      const second = document.getElementById('sort-1');
      const secondSelected = second.options[second.options.selectedIndex];
      secondSelected.selected = true;
      sortOptions[1] = secondSelected.value;
    }
    //show hide the second option
    d3.select('#option-1').classed('is-hidden', isHidden);
    sortBooks(d.target.value, 0)
  });
  document.getElementById('sort-1').addEventListener('change', (d) => {
    sortBooks(d.target.value, 1)
  });

  //links
  d3.select('#links').on('click', () => {
    d3.select('.js-mobile-menu').classed('is-hidden', false);
  });
  d3.select('#links-close').on('click', () => {
    d3.select('.js-mobile-menu').classed('is-hidden', true);
  });

  //resize
  window.addEventListener('resize', _.debounce(() => {
    const newW = getShelfWidth();
    if (newW !== divW) {
      divW = newW;
      d3.select('#shelf-svg').attr('width', divW);
      resizeShelf();
    }
  }), 500);
})();