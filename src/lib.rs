mod utils;

use rand::random;
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ForestCell {
    Dead,
    Fire,
    Tree,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
    rule: Conway,
}

// 1. trait that imlpements the rule
trait Rule<T, L> {
    fn rule(&self, cell: T, live_neighbors: L) -> T;
    fn live_neighbor_count(
        &self,
        row: u32,
        column: u32,
        cells: &Vec<T>,
        height: u32,
        width: u32,
    ) -> L;
}
struct Conway {}
struct Forest {
    grow_prob: f32,
    burn_prob: f32,
}

impl Rule<ForestCell, u8> for Forest {
    // TODO: think of how neighbors are passed in fire
    fn rule(&self, cell: ForestCell, live_neighbors: u8) -> ForestCell {
        match (cell, live_neighbors) {
            (ForestCell::Tree, x) if x > 0 => ForestCell::Fire,
            (ForestCell::Tree, _) => {
                if random::<f32>() < self.burn_prob {
                    ForestCell::Fire
                } else {
                    ForestCell::Tree
                }
            }
            (ForestCell::Fire, _) => ForestCell::Dead,
            (ForestCell::Dead, _) => {
                if random::<f32>() < self.grow_prob {
                    ForestCell::Tree
                } else {
                    ForestCell::Dead
                }
            }
        }
    }
    fn live_neighbor_count(
        &self,
        row: u32,
        column: u32,
        cells: &Vec<ForestCell>,
        height: u32,
        width: u32,
    ) -> u8 {
        let mut count = 0;
        for delta_row in [height - 1, 0, 1].iter().cloned() {
            for delta_col in [width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % height;
                let neighbor_col = (column + delta_col) % width;
                let idx = get_index(neighbor_row, neighbor_col, width);
                count += match cells[idx] {
                    ForestCell::Fire => 1,
                    _ => 0,
                };
            }
        }
        count
    }
    // var makeTreeRule = function(growProb, burnProb){
    //   return function(states){
    //     var currentState = states[0];
    //     var neighbors = states.slice(1);

    // . ✅     if (currentState === 0 && Math.random() <growProb) {return 1;}
    //   ✅  if (currentState === 1 && neighbors.indexOf(2)> -1) {return 2;}
    //   ✅  if (currentState === 1 && Math.random() <burnProb ) {return 2;}

    //     if (currentState === 2) {return 0;}
    //     return currentState;
    //   }
    // }
}

impl Rule<Cell, u8> for Conway {
    fn rule(&self, cell: Cell, live_neighbors: u8) -> Cell {
        match (cell, live_neighbors) {
            (Cell::Alive, x) if x < 2 => Cell::Dead,
            (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
            (Cell::Alive, x) if x > 3 => Cell::Dead,
            (Cell::Dead, 3) => Cell::Alive,
            (otherwise, _) => otherwise,
        }
    }
    fn live_neighbor_count(
        &self,
        row: u32,
        column: u32,
        cells: &Vec<Cell>,
        height: u32,
        width: u32,
    ) -> u8 {
        let mut count = 0;
        for delta_row in [height - 1, 0, 1].iter().cloned() {
            for delta_col in [width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % height;
                let neighbor_col = (column + delta_col) % width;
                let idx = get_index(neighbor_row, neighbor_col, width);
                count += cells[idx] as u8;
            }
        }
        count
    }
    // fn forest_rules
}
// 2. make universe impl the trait
// 3. move rule to new class that impl the rule
fn get_index(row: u32, column: u32, width: u32) -> usize {
    (row * width + column) as usize
}

#[wasm_bindgen]
impl Universe {
    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = get_index(neighbor_row, neighbor_col, self.width);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = get_index(row, col, self.width);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                let next_cell = self.rule.rule(cell, live_neighbors);
                next[idx] = next_cell;
            }
        }
        self.cells = next;
    }

    pub fn new() -> Universe {
        let width = 120;
        let height = 120;
        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();
        Universe {
            width,
            height,
            cells,
            rule: Conway {},
        }
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = get_index(row, column, self.width);
        self.cells[idx].toggle();
    }
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}
