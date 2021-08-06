import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

const data_file_name = 'data.json';

const margin = {top: 10, right: 5, bottom: 0, left: 40},
      width = ((window.innerWidth > 500) ? 260 : 400) - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

const rotate = (window.innerWidth > 500) ? 6 : 4;
let x = d3.scaleTime().range([0, width]);
let y = d3.scaleLinear().range([height / 2, 0]);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  componentDidMount() {
    d3.json('./data/' + data_file_name).then((data) => {
      this.setState((state, props) => ({
        data:data.data
      }), () => this.drawCharts());
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

  }
  drawCharts() {
    this.state.data.forEach((data, i) => {
      let svg = d3.select('.' + style.chart_containers)
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
      this.drawTitle(data, svg, i);
      this.drawCasesChart(data, svg, i);
      this.drawVaccinesChart(data, svg, i);
    });
  }
  drawTitle(data, svg) {
    svg.selectAll('.' + style.title)
      .data([data]).enter()
      .append('text')
      .attr('transform', 'translate(' + (margin.left + 5) + ',' + (margin.top - 5) + ')')
      .attr('class', style.title)
      .attr('text-anchor', 'start')
      .text((d) => d.country);
  }
  drawCasesChart(data, svg, i) {
    let g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.domain(d3.extent(data.date, (d, i) => i));
    y.domain([0, d3.max(data.new_cases_smoothed, d => d)]);

    let area = d3.area()
      .x((d, i) => x(i))
      .y0(y(0))
      .y1(d => y(d));
    g.append('linearGradient')
      .attr('id', 'area-cases-' + i)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(0))
      .attr('x2', 0).attr('y2', y(d3.max(data.new_cases_smoothed, d => d)))
    .selectAll('stop')
      .data([{offset: '0%', color: 'rgba(255, 0, 0, 0.25)'},{offset: '30%', color: 'rgba(255, 0, 0, 0.40)'},{offset: '45%', color: 'rgba(255, 0, 0, 0.55)'},{offset: '55%', color: 'rgba(255, 0, 0, 0.70)'},{offset: '60%', color: 'rgba(255, 0, 0, 0.85)'},{offset: '100%', color: 'rgba(255, 0, 0, 1.0)'}])
    .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    g.selectAll('path')
      .data([data.new_cases_smoothed]).enter()
      .append('path')
      .style('fill', 'url(#area-cases-' + i + ')')
      .attr('class', style.area)
      .attr('d', area);

    g.append('g')
      .attr('class', style.xaxis)
      .attr('transform', 'translate(0,' + y(0) + ')')
      .call(d3.axisBottom(x).tickFormat(i => '')
        .tickSizeInner(0)
        .tickSizeOuter(0));
    g.append('g')
      .attr('class', style.yaxis)
      .call(d3.axisLeft(y)
        .ticks(3)
        .tickSizeInner(3)
        .tickSizeOuter(0));
    if (i === 0) {
      this.createLegend(g, y, x);
    }
  }
  drawVaccinesChart(data, svg, i) {
    let g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + (margin.top + height / 2)+ ')');

    x.domain(d3.extent(data.date, (d, i) => i));
    y.domain([-d3.max(data.people_fully_vaccinated_per_hundred, d => d), 0]);

    let area = d3.area()
      .x((d, i) => x(i))
      .y0(y(0))
      .y1(d => -y(d));
    svg.append('linearGradient')
      .attr('id', 'area-vaccines-' + i)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(0))
      .attr('x2', 0).attr('y2', y(-70))
    .selectAll('stop')
      .data([{offset: '0%', color: 'rgba(255, 0, 0, 0.25)'},{offset: '30%', color: 'rgba(255, 0, 0, 0.40)'},{offset: '45%', color: 'rgba(255, 0, 0, 0.55)'},{offset: '55%', color: 'rgba(255, 0, 0, 0.70)'},{offset: '60%', color: 'rgba(255, 0, 0, 0.85)'},{offset: '100%', color: 'rgba(255, 0, 0, 1.0)'}])
    .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    g.selectAll('path')
      .data([data.people_fully_vaccinated_per_hundred]).enter()
      .append('path')
      .style('fill', 'url(#area-vaccines-' + i + ')')
      .attr('class', style.area)
      .attr('d', area);

    g.append('g')
    .attr('class', style.xaxis)
      .attr('transform', 'translate(0,' + y(0) + ')')
      .call(d3.axisBottom(x).tickFormat(i => '')
        .tickSizeInner(0)
        .tickSizeOuter(0));
    g.append('g')
      .attr('class', style.yaxis)
      .call(d3.axisLeft(y)
        .ticks(3)
        .tickSizeInner(3)
        .tickFormat(i => Math.abs(i))
        .tickSizeOuter(0));
  }
  createLegend(g, y, x) {
    g.append('defs')
      .append('marker')
      .attr('id', 'arrow')
      // .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
      .attr('refX', 6)
      .attr('refY', 6)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('markerUnits','userSpaceOnUse')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 12 6 0 12 3 6')
      .attr('stroke', 'black');
    g.append('path')
      .attr('d', d3.line()([[x(50), y(400)], [x(240), y(500)]]))
      .attr('stroke', 'black')
      .attr('marker-end', 'url(#arrow)')
      .attr('fill', 'none');
    g.append('path')
      .attr('d', d3.line()([[x(200), y(-400)], [x(430), y(-500)]]))
      .attr('stroke', 'black')
      .attr('marker-end', 'url(#arrow)')
      .attr('fill', 'none');

     g.append('text')
      .attr('transform', 'translate(' + (x(50)) + ',' + (y(450)) + ')rotate(-' + rotate + ')')
      .attr('class', style.legend_text)
      .attr('text-anchor', 'start')
      .text('Daily cases');
    g.append('text')
      .attr('transform', 'translate(' + (x(200)) + ',' + (y(-350)) + ')rotate(' + rotate + ')')
      .attr('class', style.legend_text)
      .attr('text-anchor', 'start')
      .text('Fully vaccinated');
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <div className={style.chart_containers}></div>
      </div>
    );
  }
}
export default App;