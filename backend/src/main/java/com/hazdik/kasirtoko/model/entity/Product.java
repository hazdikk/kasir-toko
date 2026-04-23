package com.hazdik.kasirtoko.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product extends BaseEntity {

  @Column(unique = true)
  private String barcode;

  private String name;
  private String category;
  private BigDecimal purchasePrice;
  private BigDecimal sellingPrice;
  private int stock;
}
