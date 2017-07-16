'use strict';

(() => {

  //dimensions
  const w = document.getElementById('one-quarter').clientWidth;
  const cX = w / 2;
  const cY = cX;
  const aRange = [5, 175]; //start and end angle of a circle in Radius, from the top point
  const dRange = [26, cX - 20]; //distance from the center

  //draw legend
  const arc = d3.arc()
      .innerRadius(dRange[0])
      .outerRadius(dRange[1]);
  const legend = d3.select('#legend')
    .attr('width', w)
    .attr('height', w)
    .append('g');

  function drawBg(bg, year) {
    //non fiction and fiction bg
    bg.append('path')
      .datum({ startAngle: aRange[0] * Math.PI / 180, endAngle: aRange[1] * Math.PI / 180})
      .attr('d', arc)
      .attr('transform', `translate(${cX}, ${cY})`)
      .attr('class', 'bg-arc');
    bg.append('path')
      .datum({ startAngle: -aRange[0] * Math.PI / 180, endAngle: -aRange[1] * Math.PI / 180})
      .attr('d', arc)
      .attr('transform', `translate(${cX}, ${cY})`)
      .attr('class', 'bg-arc');
    //year text in the middle
    bg.append('text')
      .attr('x', cX)
      .attr('y', cY)
      .text(year)
      .attr('class', 'bg-year-text');
  }
  drawBg(legend, 'YEAR');

  //vis values on pages, age, and rating
  //age and bookpages max vals
  //get range by 10 years and 100 pages
  const getRange = (arr, by) => {
    return [Math.floor(_.min(arr) / by) * by, Math.ceil(_.max(arr) / by) * by];
  }
  const ages = _.compact(data.map((d) => d.author.age_at_publication));
  const pages = data.map((d) => d.book.pages);
  const ageRange = getRange(ages, 10);
  const pageRange = getRange(pages, 100);
  const angle = d3.scaleLinear().domain(pageRange).range(aRange);
  const distance = d3.scaleLinear().domain(ageRange).range(dRange);
  const radius = d3.scaleLinear().domain([3, 5]).range([4, 10]); //book ratings are between 3 and 5

  //age legends
  const ageTicks = (ageRange[1] - ageRange[0]) / 10;
  const ageDist = (dRange[1] - dRange[0]) / ageTicks;
  //page legends
  const pageTicks = (pageRange[1] - pageRange[0]) / 100;
  const pageDist = (aRange[1] - aRange[0]) / pageTicks;

  function drawTicks(bg, isLegend) {
    _.each(_.range(ageTicks + 1), (i) => {
      let r = dRange[0] + i * ageDist;
      const sX = cX + Math.sin(Math.PI * aRange[0] / 180) * r;
      const sY = cY - Math.cos(Math.PI * aRange[0] / 180) * r;
      if (i % 2 === 0 || !isLegend) {
        bg.append('path')
          .attr('d', `M ${sX}
            ${sY}
            A ${r} ${r}
            0 0 1
            ${cX + Math.sin(Math.PI * aRange[1] / 180) * r}
            ${cY - Math.cos(Math.PI * aRange[1] / 180) * r}`)
          .attr('class', 'bg-line');
        if (isLegend) {
          bg.append('text')
            .attr('x', sX + 4)
            .attr('y', sY - 4)
            .text(i * 10 + ageRange[0])
            .attr('class', 'bg-tick-text');
        }
      } else if (i === ageTicks && isLegend) {
        bg.append('text')
          .attr('x', sX + 4)
          .attr('y', sY - 4)
          .text('author\'s age at publication')
          .attr('class', 'bg-tick-text');
      }
      if (!isLegend) {
        bg.append('path')
          .attr('d', `M ${cX - Math.sin(Math.PI * aRange[0] / 180) * r}
            ${cY - Math.cos(Math.PI * aRange[0] / 180) * r}
            A ${r} ${r}
            1 0 0
            ${cX - Math.sin(Math.PI * aRange[1] / 180) * r}
            ${cY - Math.cos(Math.PI * aRange[1] / 180) * r}`)
          .attr('class', 'bg-line');
      }
    });
    _.each(_.range(pageTicks + 1), (i) => {
      let a = aRange[0] + i * pageDist;
      const iX = cX - Math.sin(Math.PI * a / 180) * dRange[0];
      const iY = cY - Math.cos(Math.PI * a / 180) * dRange[0];
      const oX = cX - Math.sin(Math.PI * a / 180) * dRange[1];
      const oY = cY - Math.cos(Math.PI * a / 180) * dRange[1];
      if (i < pageTicks || !isLegend) {
        bg.append('line')
          .attr('x1', iX)
          .attr('x2', oX)
          .attr('y1', iY)
          .attr('y2', oY)
          .attr('class', 'bg-line');
        if (isLegend) {
          bg.append('text')
            .attr('x', oX + 4)
            .attr('y', oY + 4)
            .text(i * 100 + pageRange[0])
            .attr('transform', `rotate(${85 - a}, ${oX}, ${oY})`)
            .attr('class', 'bg-tick-text bg-page-text');
        }
      } else if (isLegend) {
        bg.append('text')
          .attr('x', oX + 4)
          .attr('y', oY - 4)
          .text('pages')
          .attr('transform', `rotate(${85 - a}, ${oX}, ${oY})`)
          .attr('class', 'bg-tick-text');
      }
      if (!isLegend) {
        bg.append('line')
          .attr('x1', cX + Math.sin(Math.PI * a / 180) * dRange[0])
          .attr('x2', cX + Math.sin(Math.PI * a / 180) * dRange[1])
          .attr('y1', cY - Math.cos(Math.PI * a / 180) * dRange[0])
          .attr('y2', cY - Math.cos(Math.PI * a / 180) * dRange[1])
          .attr('class', 'bg-line');
      }
    });
  }
  drawTicks(legend, true);
  _.each(['Fiction', 'Nonfiction'], (genre, i) => {
    const xPos = cX + (i === 0 ? dRange[1] / 2 + 10 : -dRange[1] / 2 - 10);
    legend.append('text')
      .attr('x', xPos)
      .attr('y', cY)
      .text(genre)
      .attr('transform', `rotate(${i === 0 ? 90 : -90}, ${xPos}, ${cY})`)
      .attr('class', `genre-${genre}`);
  });

  function drawCircles(year) {
    const g = d3.select(`#g-${year}`);
    drawBg(g, year);
    // //bg
    // g.append('circle')
    //   .attr('cx', cX)
    //   .attr('cy', cY)
    //   .attr('r', dRange[1])
    //   .attr('class', 'bg-circle');
    // g.append('circle')
    //   .attr('cx', cX)
    //   .attr('cy', cY)
    //   .attr('r', dRange[0])
    //   .attr('class', 'bg-circle');
    // g.append('line')
    //   .attr('x1', cX)
    //   .attr('x2', cX)
    //   .attr('y1', 0)
    //   .attr('y2', cY + dRange[1])
    //   .attr('class', 'bg-divider');
    //year text
    drawTicks(g, false);
    // //path - clockwise
    // g.append('path')
    //   .attr('d', `M ${cX + Math.sin(Math.PI * aRange[0] / 180) * dRange[1]}
    //     ${cY - Math.cos(Math.PI * aRange[0] / 180) * dRange[1]}
    //     A ${dRange[1]} ${dRange[1]}
    //     0 0 1
    //     ${cX + Math.sin(Math.PI * aRange[1] / 180) * dRange[1]}
    //     ${cY - Math.cos(Math.PI * aRange[1] / 180) * dRange[1]}`)
    //   .attr('class', 'bg-line');
    // //path - counter clockwise
    // g.append('path')
    //   .attr('d', `M ${cX - Math.sin(Math.PI * aRange[0] / 180) * dRange[1]}
    //     ${cY - Math.cos(Math.PI * aRange[0] / 180) * dRange[1]}
    //     A ${dRange[1]} ${dRange[1]}
    //     1 0 0
    //     ${cX - Math.sin(Math.PI * aRange[1] / 180) * dRange[1]}
    //     ${cY - Math.cos(Math.PI * aRange[1] / 180) * dRange[1]}`)
    //   .attr('class', 'bg-line');

    //books in the year
    const books = data.filter((d) => +d.year === year);
    _.each(books, (b) => {
      const a = angle(b.book.pages);
      const dist = b.author.age_at_publication ? distance(b.author.age_at_publication) : dRange[0];
      const cx = Math.sin(Math.PI * a / 180) * dist;
      const cy = Math.cos(Math.PI * a / 180) * dist;
      //fiction: clockwise, nonfiction: couter clockwise
      g.append('circle')
        .attr('cx', cX + (b.genre === 'Fiction' ? cx : -cx))
        .attr('cy', cY - cy)
        .attr('r', radius(b.book.rating))
        .attr('class', `book book-${b.author.gender}${!_.isNull(b.book.best_seller) ? ' book-best' : ''}`)
        .on('click', () => {
          console.log(b.author.name, b.author.age_at_publication, b.book.title, b.book.pages);
        });
    });
  }

  //1 - set background with all years
  const lastYear = data[0].year;
  const firstYear = data[data.length - 1].year;
  _.each(_.range(lastYear - firstYear + 1), (i) => {
    const year = lastYear - i;
    d3.select('#years')
      .append('div')
      .attr('class', 'column is-one-quarter year-wrapper is-paddingless')
      .append('svg')
      .attr('width', w)
      .attr('height', w)
      .append('g')
      .attr('id', `g-${year}`);
    drawCircles(year);
  });


})();
